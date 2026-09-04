import os
import threading
from flask import Flask
from flask_cors import CORS
from flasgger import Swagger
from app.core.db import db, migrate
from app.routers.trips import trips_bp
from app.routers.nodes import nodes_bp
from app.routers.risk import risk_bp

# How often the background Risk Radar scheduler recomputes every trip's
# proactive risk scores (seconds). Kept short so a live demo visibly shows
# the "background model thinking" without hammering the DB.
RISK_REFRESH_INTERVAL_SECONDS = 45

def create_app(test_config=None):
    app = Flask(__name__)
    
    # Enable CORS for React Dev Server (Person B)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Initialize Swagger API Documentation
    swagger_config = {
        "headers": [],
        "specs": [
            {
                "endpoint": 'apispec_1',
                "route": '/apispec_1.json',
                "rule_filter": lambda rule: True,  # all in
                "model_filter": lambda tag: True,  # all in
            }
        ],
        "static_url_path": "/flasgger_static",
        "swagger_ui": True,
        "specs_route": "/api/docs"
    }
    Swagger(app, config=swagger_config)
    
    if test_config is None:
        db_path = os.path.join(app.instance_path, 'tripresq.sqlite')
        app.config.from_mapping(
            SECRET_KEY='dev',
            SQLALCHEMY_DATABASE_URI=f'sqlite:///{db_path}',
            SQLALCHEMY_TRACK_MODIFICATIONS=False,
        )
    else:
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    db.init_app(app)
    migrate.init_app(app, db)
    
    # Import models so they are registered with SQLAlchemy
    with app.app_context():
        from app import models
        
    from app.routers.trips import trips_bp
    from app.routers.nodes import nodes_bp
    from app.routers.risk import risk_bp
    
    app.register_blueprint(trips_bp)
    app.register_blueprint(nodes_bp)
    app.register_blueprint(risk_bp)
        
    @app.route('/health')
    def health():
        return {'status': 'ok'}

    _start_risk_radar_scheduler(app)

    return app


def _start_risk_radar_scheduler(app):
    """
    Background Risk Radar scheduler.

    This is what makes the risk model *proactive* instead of reactive: it
    keeps recomputing the Confidence Score / Risk Radar for every trip in
    the DB on a fixed interval, in a daemon thread, independent of any
    request. The frontend then just polls the cheap cached
    /risk-radar endpoint instead of triggering a recompute on every call.

    Guarded so it only starts once per real process (the Flask reloader
    spawns a duplicate process in debug mode which sets WERKZEUG_RUN_MAIN).
    """
    if app.config.get('TESTING'):
        return
    if app.debug and os.environ.get('WERKZEUG_RUN_MAIN') != 'true':
        # Flask's debug reloader spawns a parent watcher + a child process;
        # only the child (the one actually serving requests) should run this.
        return
    if getattr(app, '_risk_scheduler_started', False):
        return
    app._risk_scheduler_started = True

    from app.services.risk import refresh_all_trips_risk_cache

    def _loop():
        while True:
            refresh_all_trips_risk_cache(app)
            threading.Event().wait(RISK_REFRESH_INTERVAL_SECONDS)

    thread = threading.Thread(target=_loop, name="risk-radar-scheduler", daemon=True)
    thread.start()
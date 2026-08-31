import os
from flask import Flask
from app.core.db import db, migrate

def create_app(test_config=None):
    app = Flask(__name__)
    
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
        
    @app.route('/health')
    def health():
        return {'status': 'ok'}

    return app

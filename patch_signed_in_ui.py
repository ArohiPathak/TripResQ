import re

def patch_signed_in_ui():
    with open('src/App.jsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # Wrap hero banner marketing title/subtagline in {!userAuth.loggedIn && (...)}
    old_hero_marketing = r'<div className="max-w-3xl z-10 px-2">\s*<span className="inline-flex items-center gap-1\.5 px-3 py-1\.5 rounded-full bg-white border border-slate-200 text-\[10px\] sm:text-xs font-bold text-\[\#287DFA\] mb-4 shadow-sm uppercase tracking-wider font-mono">\s*<ShieldCheck className="w-3\.5 h-3\.5 animate-pulse" /> \{t\(\'protectionBadge\'\)\}\s*</span>\s*<h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight mb-4 font-serif">\s*\{t\(\'tagline\'\)\.split\(\'\.\'\)\[0\]\}\.<br />\s*<span className="text-\[\#287DFA\]">\{t\(\'tagline\'\)\.split\(\'\.\'\)\[1\]\}</span>\s*</h1>\s*<p className="text-slate-650 text-xs sm:text-sm md:text-base max-w-2xl mx-auto mb-8 leading-relaxed font-semibold">\s*\{t\(\'subTagline\'\)\}\s*</p>\s*</div>'
    
    new_hero_marketing = """{!userAuth.loggedIn && (
                  <div className="max-w-3xl z-10 px-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-[10px] sm:text-xs font-bold text-[#287DFA] mb-4 shadow-sm uppercase tracking-wider font-mono">
                      <ShieldCheck className="w-3.5 h-3.5 animate-pulse" /> {t('protectionBadge')}
                    </span>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight mb-4 font-serif">
                      {t('tagline').split('.')[0]}.<br />
                      <span className="text-[#287DFA]">{t('tagline').split('.')[1]}</span>
                    </h1>
                    <p className="text-slate-650 text-xs sm:text-sm md:text-base max-w-2xl mx-auto mb-8 leading-relaxed font-semibold">
                      {t('subTagline')}
                    </p>
                  </div>
                )}"""

    content = re.sub(old_hero_marketing, new_hero_marketing, content, flags=re.DOTALL)

    with open('src/App.jsx', 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    patch_signed_in_ui()
    print("Patched signed-in UI clean layout successfully.")

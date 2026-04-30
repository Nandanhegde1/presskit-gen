import Link from "next/link";
import { ArrowRight, Check, Sparkles, Zap, Shield, Globe } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-600" />
              <span className="text-xl font-bold">PresskitGen</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-gray-600 hover:text-gray-900">Features</Link>
              <Link href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
              <Link href="/showcase" className="text-gray-600 hover:text-gray-900">Showcase</Link>
              <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">Login</Link>
              <Link href="/auth/signup" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Zap className="w-4 h-4" />
            No coding required · Free to start
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Professional Press Kits<br />
            <span className="text-indigo-600">in 5 Minutes</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Every indie game needs a press kit. Stop wasting hours on design and HTML. 
            Create a beautiful, SEO-optimized press kit that journalists actually want to use.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup" className="bg-indigo-600 text-white px-8 py-4 rounded-lg hover:bg-indigo-700 transition text-lg font-semibold flex items-center justify-center gap-2">
              Create Your Free Press Kit
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/showcase" className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg hover:border-gray-400 transition text-lg font-semibold">
              View Examples
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            No credit card required · Free forever plan · Upgrade anytime
          </p>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-indigo-100 mb-6 font-medium">Trusted by indie developers worldwide</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold mb-2">5 min</div>
              <div className="text-indigo-100">Average creation time</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100%</div>
              <div className="text-indigo-100">Mobile responsive</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">$0</div>
              <div className="text-indigo-100">To get started</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-xl text-gray-600">Built for indie developers, designed for journalists</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">5-Minute Setup</h3>
              <p className="text-gray-600">Fill out a simple form, upload your assets, and your press kit is live. No HTML, no FTP, no headaches.</p>
            </div>
            <div className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">SEO Optimized</h3>
              <p className="text-gray-600">Every press kit is indexed by Google. Journalists can find you when they search "[your game] press kit".</p>
            </div>
            <div className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Always Hosted</h3>
              <p className="text-gray-600">We host everything for you. Clean URLs like presskitgen.com/kit/yourgame. Optional custom domains.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Honest Pricing</h2>
            <p className="text-xl text-gray-600">Start free. Upgrade when you need more.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-white rounded-xl border-2 border-gray-200">
              <h3 className="text-xl font-bold mb-2">Free</h3>
              <div className="text-3xl font-bold mb-4">$0<span className="text-base text-gray-500">/forever</span></div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2"><Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /><span>1 press kit</span></li>
                <li className="flex items-start gap-2"><Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /><span>Default template</span></li>
                <li className="flex items-start gap-2"><Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /><span>Hosted at presskitgen.com</span></li>
                <li className="flex items-start gap-2"><Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /><span>Unlimited updates</span></li>
              </ul>
              <Link href="/auth/signup" className="block text-center w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition font-semibold">
                Start Free
              </Link>
            </div>
            
            <div className="p-6 bg-white rounded-xl border-2 border-indigo-500 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                POPULAR
              </div>
              <h3 className="text-xl font-bold mb-2">Premium Theme</h3>
              <div className="text-3xl font-bold mb-4">$9<span className="text-base text-gray-500">/one-time</span></div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2"><Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /><span>Everything in Free</span></li>
                <li className="flex items-start gap-2"><Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /><span>Choice of 3 premium templates</span></li>
                <li className="flex items-start gap-2"><Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /><span>Remove watermark</span></li>
                <li className="flex items-start gap-2"><Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /><span>Lifetime access</span></li>
              </ul>
              <Link href="/auth/signup" className="block text-center w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-semibold">
                Get Premium
              </Link>
            </div>

            <div className="p-6 bg-white rounded-xl border-2 border-gray-200">
              <h3 className="text-xl font-bold mb-2">Custom Domain</h3>
              <div className="text-3xl font-bold mb-4">$3<span className="text-base text-gray-500">/month</span></div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2"><Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /><span>Host at your own domain</span></li>
                <li className="flex items-start gap-2"><Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /><span>press.yourgame.com</span></li>
                <li className="flex items-start gap-2"><Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /><span>Easy DNS setup guide</span></li>
                <li className="flex items-start gap-2"><Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /><span>Cancel anytime</span></li>
              </ul>
              <Link href="/auth/signup" className="block text-center w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition font-semibold">
                Add Domain
              </Link>
            </div>

            <div className="p-6 bg-white rounded-xl border-2 border-gray-200">
              <h3 className="text-xl font-bold mb-2">Analytics</h3>
              <div className="text-3xl font-bold mb-4">$2<span className="text-base text-gray-500">/month</span></div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2"><Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /><span>View counts</span></li>
                <li className="flex items-start gap-2"><Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /><span>Download tracking</span></li>
                <li className="flex items-start gap-2"><Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /><span>Referrer sources</span></li>
                <li className="flex items-start gap-2"><Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /><span>Country breakdown</span></li>
              </ul>
              <Link href="/auth/signup" className="block text-center w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition font-semibold">
                Add Analytics
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to Launch Your Press Kit?</h2>
          <p className="text-xl text-gray-600 mb-8">Join hundreds of indie developers who trust PresskitGen</p>
          <Link href="/auth/signup" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-lg hover:bg-indigo-700 transition text-lg font-semibold">
            Create Free Press Kit
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-indigo-600" />
              <span className="text-xl font-bold">PresskitGen</span>
            </div>
            <p className="text-gray-600 text-sm">Press kits for indie game developers</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="#features" className="hover:text-gray-900">Features</Link></li>
              <li><Link href="#pricing" className="hover:text-gray-900">Pricing</Link></li>
              <li><Link href="/showcase" className="hover:text-gray-900">Showcase</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/docs" className="hover:text-gray-900">Documentation</Link></li>
              <li><Link href="/blog" className="hover:text-gray-900">Blog</Link></li>
              <li><Link href="/support" className="hover:text-gray-900">Support</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/privacy" className="hover:text-gray-900">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-gray-900">Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t text-center text-sm text-gray-500">
          © 2026 PresskitGen. Built with ❤️ for indie developers.
        </div>
      </footer>
    </div>
  );
}

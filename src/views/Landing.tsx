// src/views/Landing.tsx


import { Link } from 'react-router-dom';
import AppIcon from "../components/ui/AppIcon";
import Footer from "../components/layout/Footer";

export default function Landing() {
  return (
    <div className="bg-background flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5/30 via-white to-white pt-12 pb-20">
        <div className="max-w-[1120px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl font-bold text-foreground leading-tight">
                Confident revision,<br />
                <span className="text-primary dark:text-primary/70">without the stress</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Help your child stay on track with personalized GCSE revision plans.
                Get clear insights into their progress and never worry about exam prep again.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link to="/signup"
                  className="px-7 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors font-semibold text-center shadow-sm"
                >
                  Get started free
                </Link>
                <button className="px-7 py-3 border-2 border-border text-foreground rounded-full hover:border-input hover:bg-muted transition-colors font-semibold">
                  Watch demo
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="bg-primary/5 rounded-2xl shadow-lg border border-primary/20 p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-foreground">Emma's Progress</h3>
                  <span className="px-3 py-1.5 bg-success text-white text-xs font-semibold rounded-full">On Track</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-background p-4 rounded-xl text-center border border-border/50 shadow-sm">
                    <div className="text-3xl font-bold text-success mb-1">85%</div>
                    <div className="text-xs text-muted-foreground font-medium">Maths</div>
                  </div>
                  <div className="bg-background p-4 rounded-xl text-center border border-border/50 shadow-sm">
                    <div className="text-3xl font-bold text-primary mb-1">92%</div>
                    <div className="text-xs text-muted-foreground font-medium">English</div>
                  </div>
                  <div className="bg-background p-4 rounded-xl text-center border border-border/50 shadow-sm">
                    <div className="text-3xl font-bold text-warning mb-1">78%</div>
                    <div className="text-xs text-muted-foreground font-medium">Science</div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground font-medium">This week's sessions</span>
                    <span className="font-semibold text-foreground">8 of 10 completed</span>
                  </div>
                  <div className="w-full bg-primary/20/40 rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full transition-all" style={{ width: '80%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Choose Your Path Section */}
      <section className="py-20 bg-background">
        <div className="max-w-[1120px] mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">Choose your path</h2>
            <p className="text-xl text-muted-foreground">Get started with the experience that's right for you</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background border-2 border-primary/20 dark:border-primary rounded-2xl p-8 text-center hover:border-primary/50 hover:shadow-lg transition-all shadow-soft">
              <div className="w-16 h-16 bg-primary/10 dark:bg-primary/90 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AppIcon name="heart" className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">I'm a parent</h3>
              <p className="text-muted-foreground mb-6">Monitor your child's progress, get insights, and ensure they're prepared for their GCSEs.</p>
              <Link to="/signup"
                className="block w-full px-6 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors font-semibold shadow-sm"
              >
                Start as parent
              </Link>
            </div>

            <div className="bg-background border border-border rounded-2xl p-8 text-center hover:border-primary/50 transition-colors shadow-soft">
              <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AppIcon name="graduation-cap" className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">I'm a student</h3>
              <p className="text-muted-foreground mb-6">Access personalized revision plans, track your progress, and ace your GCSE exams.</p>
              <Link to="/signup"
                className="block w-full px-6 py-3 border border-input text-foreground rounded-full hover:border-primary/50 hover:text-primary transition-colors"
              >
                Start as student
              </Link>
            </div>

            <div className="bg-background border border-border rounded-2xl p-8 text-center hover:border-primary/50 transition-colors shadow-soft">
              <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AppIcon name="user" className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">I'm a teacher</h3>
              <p className="text-muted-foreground mb-6">Help your students succeed with classroom tools and progress monitoring.</p>
              <Link to="/signup"
                className="block w-full px-6 py-3 border border-input text-foreground rounded-full hover:border-primary/50 hover:text-primary transition-colors"
              >
                Start as teacher
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted">
        <div className="max-w-[1120px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary mb-4">How it works</h2>
            <p className="text-xl text-muted-foreground">Get your child exam-ready in three simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">Set up your child's profile</h3>
              <p className="text-muted-foreground">Tell us about your child's subjects, exam dates, and current confidence levels.</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">Get a personalized plan</h3>
              <p className="text-muted-foreground">We create a tailored revision schedule that fits around your child's life and learning style.</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">Track progress together</h3>
              <p className="text-muted-foreground">Monitor your child's progress with clear insights and celebrate their achievements.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-background">
        <div className="max-w-[1120px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary mb-4">Why parents choose DoorSlam</h2>
            <p className="text-xl text-muted-foreground">Trusted by thousands of families across the UK</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-background rounded-2xl p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg" alt="Parent" width={48} height={48} className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <div className="font-semibold text-foreground">Sarah M.</div>
                  <div className="text-sm text-muted-foreground">Mother of 2</div>
                </div>
              </div>
              <p className="text-muted-foreground italic">"Finally, I can see exactly how my daughter is progressing. The stress of not knowing where she stands has completely disappeared."</p>
            </div>

            <div className="bg-background rounded-2xl p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg" alt="Parent" width={48} height={48} className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <div className="font-semibold text-foreground">James K.</div>
                  <div className="text-sm text-muted-foreground">Father of 1</div>
                </div>
              </div>
              <p className="text-muted-foreground italic">"My son went from dreading revision to actually enjoying it. The personalized approach really works."</p>
            </div>

            <div className="bg-background rounded-2xl p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg" alt="Parent" width={48} height={48} className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <div className="font-semibold text-foreground">Emma T.</div>
                  <div className="text-sm text-muted-foreground">Mother of 3</div>
                </div>
              </div>
              <p className="text-muted-foreground italic">"Having clear visibility into all three of my children's revision progress has been a game-changer for our family."</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="max-w-[1120px] mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-primary mb-4">Ready to transform revision time?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of parents who've already taken the stress out of GCSE preparation.
            Start your free trial today - no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup"
              className="px-8 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors font-medium"
            >
              Start free trial
            </Link>
            <button className="px-8 py-3 border border-primary/50 dark:border-primary text-primary dark:text-primary/70 rounded-full hover:bg-primary/10 dark:hover:bg-primary/90 transition-colors font-medium">
              Book a demo
            </button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">Free for 14 days. Cancel anytime.</p>
        </div>
      </section>

      {/* Shared Footer Component */}
      <Footer />
    </div>
  );
}
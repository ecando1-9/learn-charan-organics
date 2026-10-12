"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("Enrollment & Payment Verification");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate submission / send
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 700);
  };

  return (
    <div className="pb-20">
      {/* Hero */}
      <section className="organic-bg text-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-black uppercase tracking-wider backdrop-blur">
            <Sparkles size={14} /> Student Support & Inquiries
          </span>
          <h1 className="mt-4 text-3xl font-black sm:text-5xl lg:text-6xl text-white">
            Get in Touch With Us
          </h1>
          <p className="mt-3 max-w-2xl text-base sm:text-lg text-white/80">
            Have questions about course curriculum, enrollment verification, formulation notes, or brand licensing? Our academy team is here to help.
          </p>
        </div>
      </section>

      <Section className="pt-12">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Left Column: Academy Contact Info */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-leaf">
                Direct Channels
              </p>
              <h2 className="mt-1 text-2xl font-black text-forest dark:text-cream">
                Official Academy Desk
              </h2>
              <p className="mt-2 text-sm leading-6 text-ink/70 dark:text-cream/70">
                Reach us via WhatsApp or email for rapid enrollment activation and technical support.
              </p>
            </div>

            <div className="space-y-4">
              {/* WhatsApp Support */}
              <a
                href="https://wa.me/918985482084?text=Hi%20Charan%20Organics%20Academy%2C%20I%20have%20an%20inquiry%20regarding%20courses."
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 rounded-[1.75rem] border border-forest/10 bg-white p-5 shadow-soft transition hover:border-emerald-500 hover:shadow-glass dark:border-white/10 dark:bg-white/5"
              >
                <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
                  <MessageCircle size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-forest dark:text-cream text-base">
                      WhatsApp Support Helpline
                    </h3>
                    <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                      Fastest
                    </span>
                  </div>
                  <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                    +91 89854 82084
                  </p>
                  <p className="text-xs text-ink/55 dark:text-cream/55 mt-1">
                    Instant response for payment confirmations and login questions.
                  </p>
                </div>
              </a>

              {/* Email Support */}
              <a
                href="mailto:orders@charanorganics.com"
                className="group flex items-start gap-4 rounded-[1.75rem] border border-forest/10 bg-white p-5 shadow-soft transition hover:border-leaf hover:shadow-glass dark:border-white/10 dark:bg-white/5"
              >
                <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-leaf/10 text-leaf group-hover:bg-leaf group-hover:text-white transition">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="font-black text-forest dark:text-cream text-base">
                    Official Academy Email
                  </h3>
                  <p className="text-sm font-bold text-leaf mt-0.5">
                    orders@charanorganics.com
                  </p>
                  <p className="text-xs text-ink/55 dark:text-cream/55 mt-1">
                    For course certifications, invoice receipts, and corporate inquiries.
                  </p>
                </div>
              </a>

              {/* Operating Hours */}
              <div className="flex items-start gap-4 rounded-[1.75rem] border border-forest/10 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-white/5">
                <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-clay/10 text-clay">
                  <Clock size={24} />
                </div>
                <div>
                  <h3 className="font-black text-forest dark:text-cream text-base">
                    Working Hours
                  </h3>
                  <p className="text-xs font-bold text-forest dark:text-cream mt-0.5">
                    Monday – Saturday: 9:30 AM – 6:30 PM IST
                  </p>
                  <p className="text-xs text-ink/55 dark:text-cream/55 mt-1">
                    Digital courses and learning platform accessible 24/7.
                  </p>
                </div>
              </div>

              {/* Head Office */}
              <div className="flex items-start gap-4 rounded-[1.75rem] border border-forest/10 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-white/5">
                <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-forest/10 text-forest dark:bg-white/10 dark:text-cream">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="font-black text-forest dark:text-cream text-base">
                    Academy Headquarters
                  </h3>
                  <p className="text-xs text-ink/70 dark:text-cream/70 mt-0.5">
                    Charan Organics Learning Center, Andhra Pradesh / Telangana, India
                  </p>
                  <p className="text-[11px] text-ink/50 dark:text-cream/50 mt-1 flex items-center gap-1">
                    <ShieldCheck size={12} className="text-leaf" /> Registered Trademark under The Trademarks Act 1999
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="rounded-[2.5rem] bg-white p-6 sm:p-10 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10">
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="mx-auto grid size-20 place-items-center rounded-full bg-emerald-500/10 text-emerald-600">
                    <CheckCircle2 size={44} />
                  </div>
                  <h3 className="text-2xl font-black text-forest dark:text-cream">
                    Message Sent Successfully!
                  </h3>
                  <p className="max-w-md mx-auto text-sm text-ink/70 dark:text-cream/70">
                    Thank you for reaching out, <span className="font-bold text-forest dark:text-cream">{name}</span>. Our faculty team will review your message and reply via email or WhatsApp within a few hours.
                  </p>
                  <Button
                    onClick={() => {
                      setSubmitted(false);
                      setMessage("");
                    }}
                    className="rounded-full bg-forest text-white hover:bg-leaf mt-4"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-black text-forest dark:text-cream">
                      Send a Direct Message
                    </h2>
                    <p className="text-xs text-ink/60 dark:text-cream/60 mt-1">
                      Fill out the form below and an academy representative will get back to you shortly.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-bold text-forest dark:text-cream mb-1.5 block">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Priyadarshini Rao"
                        className="w-full rounded-2xl border border-forest/15 bg-linen/50 px-4 py-3 text-sm text-forest placeholder:text-ink/40 focus:border-leaf focus:bg-white focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-cream"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-forest dark:text-cream mb-1.5 block">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full rounded-2xl border border-forest/15 bg-linen/50 px-4 py-3 text-sm text-forest placeholder:text-ink/40 focus:border-leaf focus:bg-white focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-cream"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-bold text-forest dark:text-cream mb-1.5 block">
                        WhatsApp Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full rounded-2xl border border-forest/15 bg-linen/50 px-4 py-3 text-sm text-forest placeholder:text-ink/40 focus:border-leaf focus:bg-white focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-cream"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-forest dark:text-cream mb-1.5 block">
                        Subject / Department *
                      </label>
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full rounded-2xl border border-forest/15 bg-linen/50 px-4 py-3 text-sm text-forest focus:border-leaf focus:bg-white focus:outline-none dark:border-white/10 dark:bg-[#11221a] dark:text-cream"
                      >
                        <option value="Enrollment & Payment Verification" className="bg-white text-forest dark:bg-[#11221a] dark:text-cream">Enrollment & Payment Verification</option>
                        <option value="Course Video & Lesson Player" className="bg-white text-forest dark:bg-[#11221a] dark:text-cream">Course Video & Lesson Player</option>
                        <option value="Formulation Notes & PDF Downloads" className="bg-white text-forest dark:bg-[#11221a] dark:text-cream">Formulation Notes & PDF Downloads</option>
                        <option value="Certificate Eligibility & Issuance" className="bg-white text-forest dark:bg-[#11221a] dark:text-cream">Certificate Eligibility & Issuance</option>
                        <option value="Business & Manufacturing Guidance" className="bg-white text-forest dark:bg-[#11221a] dark:text-cream">Business & Manufacturing Guidance</option>
                        <option value="Other Inquiries" className="bg-white text-forest dark:bg-[#11221a] dark:text-cream">Other Inquiries</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-forest dark:text-cream mb-1.5 block">
                      Your Message *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please describe how we can assist you..."
                      className="w-full rounded-2xl border border-forest/15 bg-linen/50 px-4 py-3 text-sm text-forest placeholder:text-ink/40 focus:border-leaf focus:bg-white focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-cream"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-2xl bg-forest py-4 text-sm font-black text-white hover:bg-leaf transition shadow-md"
                  >
                    {submitting ? "Sending inquiry..." : "Send Inquiry"} <Send size={16} />
                  </Button>

                  <p className="text-[11px] text-center text-ink/50 dark:text-cream/50">
                    We respect your privacy. Inquiries are handled strictly by academy staff.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

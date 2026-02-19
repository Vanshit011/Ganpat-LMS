import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "./_app";
import Head from "next/head";
import toast from "react-hot-toast";

export default function Login() {
  const { login, api } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api("/api/auth/login", { method: "POST", body: form });
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}! 👋`);
      router.push("/dashboard");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login – Ganpat University LMS</title>
      </Head>
      <div className="min-h-screen flex">
        {/* Left – decorative */}
        <div
          className="hidden lg:flex lg:w-1/2 flex-col justify-between p-14 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(160deg,#14532d 0%,#1a6b3a 50%,#2EAD5C 100%)",
          }}
        >
          {/* Circles */}
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/5" />
          <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-white/5" />
          <div className="absolute top-1/2 -right-16 w-48 h-48 rounded-full bg-white/5" />

          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white font-bold text-2xl mb-6 shadow-lg">
              GU
            </div>
            <h1 className="text-4xl font-heading font-bold text-white leading-tight">
              Ganpat University
            </h1>
            <p className="text-green-200 mt-2 text-lg">
              Learning Management System
            </p>
          </div>

          <div className="relative z-10 space-y-4">
            {[
              {
                icon: "🎓",
                t: "Academic Excellence",
                d: "Access courses, materials and resources anytime, anywhere.",
              },
              {
                icon: "📝",
                t: "Smart Assignments",
                d: "Submit work, receive grades and feedback seamlessly.",
              },
              {
                icon: "📊",
                t: "Track Progress",
                d: "Monitor your performance with real-time insights.",
              },
            ].map((f) => (
              <div
                key={f.t}
                className="flex gap-4 bg-white/10 backdrop-blur rounded-2xl p-4"
              >
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <p className="text-white font-semibold text-sm">{f.t}</p>
                  <p className="text-green-200 text-xs mt-0.5">{f.d}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="relative z-10 text-green-300 text-xs">
            © {new Date().getFullYear()} Ganpat University. All rights reserved.
          </p>
        </div>

        {/* Right – form */}
        <div className="flex-1 flex items-center justify-center p-8 bg-ganpat-off-white">
          <div className="w-full max-w-md animate-fade-in">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow"
                style={{
                  background: "linear-gradient(135deg,#1a6b3a,#2EAD5C)",
                }}
              >
                GU
              </div>
              <div>
                <p className="font-heading font-bold text-ganpat-green text-sm">
                  Ganpat University LMS
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-green-100 p-8">
              <h2 className="text-2xl font-heading font-bold text-ganpat-green mb-1">
                Sign In
              </h2>
              <p className="text-gray-400 text-sm mb-8">
                Enter your university credentials
              </p>

              <form onSubmit={handle} className="space-y-5">
                <div>
                  <label className="label">Email Address</label>
                  <input
                    type="email"
                    className="input"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <input
                      type={show ? "text" : "password"}
                      className="input pr-11"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                      onClick={() => setShow(!show)}
                    >
                      {show ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3"
                >
                  {loading ? "⏳ Signing in…" : "🔐 Sign In"}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                New student?{" "}
                <Link
                  href="/register"
                  className="text-ganpat-green font-semibold hover:underline"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

import { useState, useEffect } from "react";

const SYSTEM_PROMPT = `You are a writing assistant that writes Twitter/X posts in one specific person's voice and style.

Here are real examples of their writing:

EXAMPLE 1:
After realizing a lot of things, I learned:
- Never make panic posts.
- Post what you believe.
- Know why you're posting.
- Don't chase every trend.
- Consistency > hype.
- Build your own voice.
- Focus on value, not noise.

The biggest lesson?
A strong reputation takes months to build and minutes to damage. Choose every post carefully. ✍️

EXAMPLE 2:
Most AI projects are building products.
Cluster Protocol is building the rails.
- 500+ AI models
- tokenized datasets
- x402 agent payments
- ERC-8004 agent identity
- Prompt-to-dApp deployment via CodeXero

All connected in a single on-chain ecosystem on Base.
The most interesting part isn't the individual features.
it's the closed loop economy where creators, developers, and AI agents can all create, contribute, and earn from the same infrastructure.

Do you think AI agents will become real economic participants on-chain, or is the industry still too early?

EXAMPLE 3:
I spent 12+ hours on CT yesterday
Here's what happened:
- Made new connections
- Learned something new
- Supported my mutuals
- Shared value & memes
- Got ignored by some people
- Got noticed by others

The biggest takeaway?
CT rewards consistency more than talent.
Most people quit after a few days. Most opportunities come after weeks or months of showing up.
Keep building. Keep replying. Keep cooking.
What's your average time spent on CT per day?

STYLE RULES — follow these strictly:
- Short punchy lines, one idea per line
- Bullet lists that build momentum
- Always include a "biggest lesson" or key takeaway moment
- End with a question to drive engagement
- Casual but thoughtful tone — never try-hard
- Simple everyday words, no unnecessary jargon
- Great use of white space and rhythm
- Use contrast phrases like "Most people X. But Y."
- Use 1-2 relevant emojis max, never overdo it

Write ONLY the post. No intro. No explanation. No "Here's a post:". Just the raw post text.`;

const TONES = ["Default", "Bold", "Reflective", "Educational", "Hype"];

export default function RBJPostGen() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Default");
  const [post, setPost] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("rbj_history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const generatePost = async () => {
    if (!topic.trim() || loading) return;
    setLoading(true);
    setPost("");
    setCopied(false);

    const toneInstruction = tone !== "Default"
      ? `\n\nTone modifier: Make the post feel ${tone.toLowerCase()}.`
      : "";

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT + toneInstruction,
          messages: [{ role: "user", content: `Write a Twitter/X post about: ${topic}` }],
        }),
      });

      const data = await response.json();
      const text = data.content?.[0]?.text || "";
      setPost(text);

      const newEntry = { topic, tone, post: text, date: new Date().toLocaleDateString() };
      const updated = [newEntry, ...history].slice(0, 10);
      setHistory(updated);
      localStorage.setItem("rbj_history", JSON.stringify(updated));
    } catch {
      setPost("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(post);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const charCount = post.length;
  const tweetSafe = charCount <= 280;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#06060a",
      color: "#e8e4dc",
      fontFamily: "'Courier New', monospace",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Animated background grid */}
      <div style={{
        position: "fixed",
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      {/* Glow accent top-left */}
      <div style={{
        position: "fixed",
        top: "-120px",
        left: "-80px",
        width: "400px",
        height: "400px",
        background: "radial-gradient(circle, rgba(255,200,80,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      {/* Glow accent bottom-right */}
      <div style={{
        position: "fixed",
        bottom: "-100px",
        right: "-60px",
        width: "360px",
        height: "360px",
        background: "radial-gradient(circle, rgba(255,120,60,0.05) 0%, transparent 70%)",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      {/* Nav */}
      <nav style={{
        position: "relative",
        zIndex: 10,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 32px",
        borderBottom: "1px solid #111",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "28px",
            height: "28px",
            background: "#f5c842",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            fontWeight: "bold",
            color: "#06060a",
          }}>R</div>
          <span style={{ fontSize: "15px", letterSpacing: "2px", color: "#e8e4dc" }}>
            RBJ <span style={{ color: "#f5c842" }}>POST GEN</span>
          </span>
        </div>

        <button
          onClick={() => setShowHistory(!showHistory)}
          style={{
            background: "transparent",
            border: "1px solid #1e1e1e",
            color: "#555",
            padding: "7px 16px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "11px",
            letterSpacing: "2px",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.target.style.borderColor = "#333"; e.target.style.color = "#888"; }}
          onMouseLeave={e => { e.target.style.borderColor = "#1e1e1e"; e.target.style.color = "#555"; }}
        >
          {showHistory ? "← BACK" : `HISTORY (${history.length})`}
        </button>
      </nav>

      {/* Main content */}
      <main style={{
        position: "relative",
        zIndex: 10,
        maxWidth: "680px",
        margin: "0 auto",
        padding: "60px 24px 80px",
      }}>

        {!showHistory ? (
          <>
            {/* Hero */}
            <div style={{
              marginBottom: "56px",
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(16px)",
              transition: "all 0.6s ease",
            }}>
              <div style={{
                fontSize: "11px",
                letterSpacing: "4px",
                color: "#f5c842",
                marginBottom: "16px",
                textTransform: "uppercase",
              }}>
                Your personal post generator
              </div>
              <h1 style={{
                fontSize: "clamp(40px, 8vw, 72px)",
                fontWeight: "400",
                margin: "0 0 16px",
                lineHeight: "1.05",
                letterSpacing: "-1px",
                fontFamily: "'Georgia', serif",
                color: "#f0ece4",
              }}>
                Write in your<br />
                <span style={{ color: "#f5c842" }}>own voice.</span>
              </h1>
              <p style={{
                color: "#333",
                fontSize: "13px",
                letterSpacing: "1px",
                lineHeight: "1.8",
              }}>
                Drop a topic. Get a post that sounds exactly like you.
              </p>
            </div>

            {/* Input card */}
            <div style={{
              background: "#0d0d10",
              border: "1px solid #161618",
              borderRadius: "16px",
              overflow: "hidden",
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(24px)",
              transition: "all 0.6s ease 0.1s",
            }}>
              {/* Topic */}
              <div style={{ padding: "28px 28px 0" }}>
                <label style={{
                  display: "block",
                  fontSize: "10px",
                  letterSpacing: "3px",
                  color: "#333",
                  textTransform: "uppercase",
                  marginBottom: "10px",
                }}>
                  Topic
                </label>
                <textarea
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) generatePost(); }}
                  placeholder="e.g. staying consistent on CT, AI agents, burnout in web3..."
                  rows={3}
                  style={{
                    width: "100%",
                    background: "#06060a",
                    border: "1px solid #161618",
                    borderRadius: "10px",
                    padding: "14px 16px",
                    color: "#c8c4bc",
                    fontSize: "14px",
                    fontFamily: "'Georgia', serif",
                    resize: "none",
                    outline: "none",
                    boxSizing: "border-box",
                    lineHeight: "1.7",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={e => e.target.style.borderColor = "#2a2a2a"}
                  onBlur={e => e.target.style.borderColor = "#161618"}
                />
              </div>

              {/* Tone selector */}
              <div style={{ padding: "20px 28px 0" }}>
                <label style={{
                  display: "block",
                  fontSize: "10px",
                  letterSpacing: "3px",
                  color: "#333",
                  textTransform: "uppercase",
                  marginBottom: "10px",
                }}>
                  Tone
                </label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {TONES.map(t => (
                    <button
                      key={t}
                      onClick={() => setTone(t)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "20px",
                        border: `1px solid ${tone === t ? "#f5c842" : "#1e1e1e"}`,
                        background: tone === t ? "rgba(245,200,66,0.08)" : "transparent",
                        color: tone === t ? "#f5c842" : "#444",
                        fontSize: "11px",
                        letterSpacing: "1px",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate */}
              <div style={{ padding: "20px 28px 28px" }}>
                <button
                  onClick={generatePost}
                  disabled={loading || !topic.trim()}
                  style={{
                    width: "100%",
                    padding: "15px",
                    background: loading || !topic.trim() ? "#111" : "#f5c842",
                    color: loading || !topic.trim() ? "#2a2a2a" : "#06060a",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "12px",
                    fontFamily: "'Courier New', monospace",
                    letterSpacing: "3px",
                    textTransform: "uppercase",
                    cursor: loading || !topic.trim() ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                    fontWeight: "700",
                  }}
                >
                  {loading ? "Writing..." : "Generate Post"}
                </button>
                <div style={{ textAlign: "right", marginTop: "8px", fontSize: "10px", color: "#222", letterSpacing: "1px" }}>
                  Ctrl + Enter
                </div>
              </div>
            </div>

            {/* Output card */}
            {(post || loading) && (
              <div style={{
                marginTop: "20px",
                background: "#0d0d10",
                border: "1px solid #161618",
                borderRadius: "16px",
                overflow: "hidden",
                animation: "fadeUp 0.4s ease",
              }}>
                <style>{`
                  @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                  }
                  @keyframes pulse {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 1; }
                  }
                `}</style>

                {loading ? (
                  <div style={{ padding: "48px 28px", textAlign: "center" }}>
                    <div style={{ fontSize: "28px", marginBottom: "12px", animation: "pulse 1.4s infinite" }}>✍️</div>
                    <div style={{ fontSize: "11px", color: "#333", letterSpacing: "3px" }}>WRITING IN YOUR VOICE...</div>
                  </div>
                ) : (
                  <div style={{ padding: "28px" }}>
                    {/* Output header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                      <span style={{ fontSize: "10px", letterSpacing: "3px", color: "#333" }}>YOUR POST</span>
                      <span style={{
                        fontSize: "11px",
                        color: tweetSafe ? "#444" : "#c0392b",
                        letterSpacing: "1px",
                      }}>
                        {charCount} chars {tweetSafe ? "" : "⚠️ long"}
                      </span>
                    </div>

                    <textarea
                      value={post}
                      onChange={e => setPost(e.target.value)}
                      rows={12}
                      style={{
                        width: "100%",
                        background: "#06060a",
                        border: "1px solid #161618",
                        borderRadius: "10px",
                        padding: "16px",
                        color: "#c8c4bc",
                        fontSize: "14px",
                        fontFamily: "'Georgia', serif",
                        resize: "vertical",
                        outline: "none",
                        boxSizing: "border-box",
                        lineHeight: "1.9",
                      }}
                    />

                    <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
                      <button
                        onClick={handleCopy}
                        style={{
                          flex: 1,
                          padding: "12px",
                          background: copied ? "rgba(245,200,66,0.1)" : "#111",
                          color: copied ? "#f5c842" : "#555",
                          border: `1px solid ${copied ? "rgba(245,200,66,0.3)" : "#1e1e1e"}`,
                          borderRadius: "8px",
                          fontSize: "11px",
                          letterSpacing: "2px",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          fontFamily: "'Courier New', monospace",
                        }}
                      >
                        {copied ? "✓ COPIED" : "COPY"}
                      </button>
                      <button
                        onClick={generatePost}
                        style={{
                          flex: 1,
                          padding: "12px",
                          background: "#111",
                          color: "#555",
                          border: "1px solid #1e1e1e",
                          borderRadius: "8px",
                          fontSize: "11px",
                          letterSpacing: "2px",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          fontFamily: "'Courier New', monospace",
                        }}
                        onMouseEnter={e => e.target.style.color = "#888"}
                        onMouseLeave={e => e.target.style.color = "#555"}
                      >
                        REGENERATE
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          /* History view */
          <div>
            <h2 style={{
              fontSize: "28px",
              fontFamily: "'Georgia', serif",
              fontWeight: "400",
              marginBottom: "32px",
              color: "#e8e4dc",
            }}>
              Post History
            </h2>

            {history.length === 0 ? (
              <div style={{ textAlign: "center", color: "#333", padding: "80px 0", fontSize: "13px", letterSpacing: "2px" }}>
                NO POSTS YET
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {history.map((item, i) => (
                  <div key={i} style={{
                    background: "#0d0d10",
                    border: "1px solid #161618",
                    borderRadius: "12px",
                    padding: "20px 22px",
                    cursor: "pointer",
                    transition: "border-color 0.2s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "#2a2a2a"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "#161618"}
                    onClick={() => {
                      setTopic(item.topic);
                      setPost(item.post);
                      setTone(item.tone);
                      setShowHistory(false);
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                      <span style={{ fontSize: "10px", color: "#f5c842", letterSpacing: "2px" }}>
                        {item.topic.slice(0, 40)}{item.topic.length > 40 ? "..." : ""}
                      </span>
                      <span style={{ fontSize: "10px", color: "#2a2a2a", letterSpacing: "1px" }}>{item.date}</span>
                    </div>
                    <p style={{
                      fontSize: "13px",
                      color: "#444",
                      lineHeight: "1.7",
                      margin: 0,
                      fontFamily: "'Georgia', serif",
                    }}>
                      {item.post.slice(0, 120)}...
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        position: "relative",
        zIndex: 10,
        textAlign: "center",
        padding: "24px",
        borderTop: "1px solid #0e0e0e",
        fontSize: "10px",
        color: "#1e1e1e",
        letterSpacing: "3px",
      }}>
        RBJ POST GEN — BUILT FOR YOUR VOICE
      </footer>
    </div>
  );
  }

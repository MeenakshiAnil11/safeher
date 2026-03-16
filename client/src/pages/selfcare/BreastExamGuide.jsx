import React from "react";

const performCards = [
  {
    title: "For Menstruating Women",
    text: "Perform the exam 3-5 days after your period ends, when breasts are least likely to be swollen or tender.",
  },
  {
    title: "For Post-Menopausal Women",
    text: "Choose a specific day each month and perform the exam on the same day consistently.",
  },
  {
    title: "Frequency",
    text: "Perform self-examinations once a month to become familiar with how your breasts normally feel.",
  },
];

const steps = [
  {
    step: "STEP 1",
    icon: "◉",
    title: "Check in Front of Mirror",
    desc: "Stand in front of a mirror with your arms by your sides. Look for any changes in size, shape, or contour of your breasts.",
    lookFor: [
      "Check for dimpling, puckering, or bulging of the skin",
      "Look for nipple changes - position or inversion",
      "Note any redness, soreness, rash, or swelling",
    ],
    tone: "border-pink-200 bg-rose-50",
    marker: "marker:text-pink-500",
  },
  {
    step: "STEP 2",
    icon: "✋",
    title: "Raise Arms and Observe",
    desc: "Raise your arms above your head and look for the same changes as in Step 1.",
    lookFor: [
      "Check if both breasts move equally",
      "Look for any unusual changes in contour",
      "Observe skin texture variations",
    ],
    tone: "border-violet-200 bg-violet-50",
    marker: "marker:text-violet-500",
  },
  {
    step: "STEP 3",
    icon: "☝",
    title: "Feel Breast Tissue",
    desc: "Lie down and use your right hand to feel your left breast, then vice versa. Use a firm, smooth touch with the first few fingers.",
    lookFor: [
      "Cover the entire breast from top to bottom, side to side",
      "Use circular motions about the size of a quarter",
      "Apply light, medium, and firm pressure",
    ],
    tone: "border-cyan-200 bg-cyan-50",
    marker: "marker:text-cyan-500",
  },
  {
    step: "STEP 4",
    icon: "◌",
    title: "Check for Lumps",
    desc: "Feel your breasts while standing or sitting. Many women find this easier in the shower when skin is wet and slippery.",
    lookFor: [
      "Use the same hand movements as in Step 3",
      "Check the entire breast and armpit area",
      "Feel for any lumps, thickening, or hardened knots",
    ],
    tone: "border-rose-200 bg-rose-50",
    marker: "marker:text-rose-500",
  },
];

export default function BreastExamGuide() {
  return (
    <div className="space-y-6 p-5 text-left font-['Poppins','Inter',sans-serif] leading-[1.5]">
      <section className="rounded-2xl bg-gradient-to-r from-fuchsia-500 via-purple-500 to-violet-600 p-6 text-white shadow-sm">
        <h2 className="!text-[24px] !font-bold leading-[1.5]">◷ When to Perform Self Exam</h2>
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          {performCards.map((card) => (
            <article key={card.title} className="rounded-2xl bg-white/16 p-4 backdrop-blur-[1px]">
              <h3 className="!text-[24px] !font-bold leading-[1.5] text-white">{card.title}</h3>
              <p className="mt-4 text-base font-normal leading-[1.5] text-fuchsia-50">{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h3 className="!text-[24px] !font-bold leading-[1.5] text-slate-800">Step-by-Step Instructions</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {steps.map((item) => (
            <article key={item.step} className={`rounded-2xl border p-6 ${item.tone}`}>
              <p className="flex items-center gap-3 text-base font-semibold leading-[1.5] text-slate-600">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-pink-600">{item.icon}</span>
                {item.step}
              </p>
              <h4 className="mt-4 !text-[24px] !font-bold leading-[1.5] text-slate-900">{item.title}</h4>
              <p className="mt-4 text-base font-normal leading-[1.5] text-slate-700">{item.desc}</p>

              <div className="mt-5 rounded-2xl bg-white p-4">
                <p className="!text-[24px] !font-bold leading-[1.5] text-slate-900">What to Look For:</p>
                <ul className={`mt-4 list-disc space-y-2 pl-5 text-base font-normal leading-[1.5] text-slate-700 ${item.marker}`}>
                  {item.lookFor.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
        <h3 className="!text-[24px] !font-bold leading-[1.5] text-slate-900">⚠ Warning Signs to Look For</h3>
        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <article className="rounded-2xl bg-white p-4">
            <h4 className="!text-[24px] !font-bold leading-[1.5] text-slate-900">Physical Changes</h4>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-base font-normal leading-[1.5] text-slate-700 marker:text-rose-500">
              <li>New lump in breast or armpit</li>
              <li>Thickening or swelling of breast</li>
              <li>Change in size or shape</li>
            </ul>
          </article>
          <article className="rounded-2xl bg-white p-4">
            <h4 className="!text-[24px] !font-bold leading-[1.5] text-slate-900">Skin Changes</h4>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-base font-normal leading-[1.5] text-slate-700 marker:text-rose-500">
              <li>Dimpling or puckering of skin</li>
              <li>Redness or flaky skin</li>
              <li>Irritation or itching</li>
            </ul>
          </article>
          <article className="rounded-2xl bg-white p-4">
            <h4 className="!text-[24px] !font-bold leading-[1.5] text-slate-900">Nipple Changes</h4>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-base font-normal leading-[1.5] text-slate-700 marker:text-rose-500">
              <li>Nipple retraction or inversion</li>
              <li>Unusual discharge (not milk)</li>
              <li>Pain in nipple area</li>
            </ul>
          </article>
        </div>

        <article className="mt-6 rounded-2xl border border-rose-300 bg-white p-5">
          <h4 className="!text-[24px] !font-bold leading-[1.5] text-slate-900">⚠ Important Advisory</h4>
          <p className="mt-4 text-base font-normal leading-[1.5] text-slate-700">
            If you detect any of the above abnormalities during your self-examination, consult a doctor
            immediately. Early detection significantly improves treatment outcomes. Remember that 8 out of 10
            breast lumps are not cancerous, but professional evaluation is essential.
          </p>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="rounded-2xl bg-violet-50 p-5">
          <h3 className="!text-[24px] !font-bold leading-[1.5] text-slate-900">Examination Tips</h3>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-base font-normal leading-[1.5] text-slate-700 marker:text-violet-500">
            <li>Use the pads of your fingers, not the tips</li>
            <li>Apply three levels of pressure: light, medium, and firm</li>
            <li>Follow a consistent pattern each time</li>
            <li>Take your time - the exam should take several minutes</li>
          </ul>
        </article>
        <article className="rounded-2xl bg-cyan-50 p-5">
          <h3 className="!text-[24px] !font-bold leading-[1.5] text-slate-900">What's Normal?</h3>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-base font-normal leading-[1.5] text-slate-700 marker:text-cyan-500">
            <li>Breasts may feel lumpy or have ridge-like texture</li>
            <li>Size and shape may vary between breasts</li>
            <li>Tenderness before menstruation is common</li>
            <li>Breast tissue extends into the armpit area</li>
          </ul>
        </article>
      </section>

      <section className="rounded-2xl bg-white p-8 text-center ring-1 ring-slate-200">
        <h3 className="!text-[24px] !font-bold leading-[1.5] text-slate-900">Need Professional Guidance?</h3>
        <p className="mx-auto mt-4 max-w-3xl text-base font-normal leading-[1.5] text-slate-600">
          If you're unsure about how to perform a self-examination or have concerns about changes in your
          breasts, schedule an appointment with your healthcare provider.
        </p>
        <button type="button" className="mt-6 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 px-8 py-3 text-sm font-semibold text-white md:text-base">
          Schedule Consultation
        </button>
      </section>
    </div>
  );
}

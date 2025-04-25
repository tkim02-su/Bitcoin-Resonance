// app/components/AboutSection.tsx
'use client';

export default function AboutSection() {
  return (
    <section className="w-full flex items-center justify-center py-20 px-6 bg-transparent">
      <div className="max-w-3xl text-center text-white bg-black bg-opacity-60 rounded-xl p-8 shadow-xl">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">About Bitcoin Resonance</h2>
        <p className="text-base md:text-lg text-gray-300 leading-relaxed">
          Bitcoin Resonance isn't just a data display — it's a living, breathing visual poem powered by the heartbeat of global
          crypto markets. Each beat of the heart reflects the rhythm of Bitcoin’s trading volume in real time.
          As thousands of transactions pulse through the blockchain every second, this site transforms raw data into something deeply human:
          a feeling, a presence, a moment in the cosmos. This is not finance — it's resonance.
        </p>
      </div>
    </section>
  );
}

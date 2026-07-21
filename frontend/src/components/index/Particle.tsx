import Particles, { ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine } from "@tsparticles/engine";
import type { ISourceOptions } from "@tsparticles/engine";

// React の再レンダリングで参照が変わらないよう、関数およびオプションを外で定義
const initParticles = async (engine: Engine) => {
  await loadSlim(engine);
};

const particlesOptions: ISourceOptions = {
  fullScreen: { enable: true, zIndex: 1 }, // 白背景(z-0)の上、コンテンツ(z-10)の下に重ねる
  background: { color: { value: "#5c7392ff" } },
  fpsLimit: 120,
  particles: {
    color: { value: "#4f77ccff" }, // くっきり見えるロイヤルブルー
    links: {
      color: "#3769b9ff", // 線も鮮やかなブルー
      distance: 150,
      enable: true,
      opacity: 0.9,
      width: 2,
    },
    move: { enable: true, speed: 1.5 },
    number: { value: 70 },
    opacity: { value: 0.8 },
    size: { value: { min: 1, max: 3 } },
  },
};

export default function ParticleBackground() {
  return (
    <ParticlesProvider init={initParticles}>
      <Particles id="tsparticles" options={particlesOptions} />
    </ParticlesProvider>
  );
}

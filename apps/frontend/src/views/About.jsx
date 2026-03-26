import { Link } from 'react-router-dom';
import SEOMeta from '../components/SEOMeta';

const About = () => (
  <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto min-h-screen">
    <SEOMeta title="Sobre Nosotros" description="Trebor Labs — hardware técnico editorial para entusiastas de teclados mecánicos y Raspberry Pi." />

    <div className="mb-16 space-y-4">
      <p className="font-mono text-primary text-xs tracking-widest uppercase">Quiénes somos</p>
      <h1 className="font-headline font-black text-5xl tracking-tighter">Trebor Labs</h1>
      <p className="text-xl text-on-surface-variant max-w-2xl leading-relaxed">
        Hardware técnico editorial para entusiastas que exigen lo mejor en periféricos y plataformas de desarrollo.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
      <div className="space-y-4">
        <h2 className="font-headline font-bold text-xl">Nuestra Misión</h2>
        <p className="text-on-surface-variant leading-relaxed">
          Creemos que el hardware de calidad transforma la experiencia de trabajo y creatividad. Cubramos la brecha entre el entusiasta técnico y el equipo que merece: teclados mecánicos crafteados a mano y kits Raspberry Pi configurados para producción real.
        </p>
      </div>
      <div className="space-y-4">
        <h2 className="font-headline font-bold text-xl">¿Por qué Trebor Labs?</h2>
        <p className="text-on-surface-variant leading-relaxed">
          Cada producto que ofrecemos pasa por nuestro equipo técnico. No vendemos cajas — cubramos kits completos, documentación, soporte y una comunidad de makers que hablan tu idioma.
        </p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
      {[
        { label: 'Productos', value: '50+', desc: 'Teclados y kits en catálogo' },
        { label: 'Comunidad', value: '2K+', desc: 'Tacticioners activos' },
        { label: 'Soporte', value: '24/7', desc: 'Respuesta en menos de 12h' },
      ].map(({ label, value, desc }) => (
        <div key={label} className="bg-surface-container-low rounded-xl border border-outline-variant/10 p-8 text-center space-y-2">
          <p className="font-headline font-black text-4xl text-primary">{value}</p>
          <p className="font-bold text-sm">{label}</p>
          <p className="text-xs text-on-surface-variant">{desc}</p>
        </div>
      ))}
    </div>

    <div className="bg-gradient-to-br from-primary/10 to-primary-container/20 rounded-2xl p-10 text-center space-y-4 border border-primary/20">
      <h2 className="font-headline font-bold text-2xl">¿Listo para actualizar tu setup?</h2>
      <p className="text-on-surface-variant">Explora nuestro catálogo de hardware técnico seleccionado.</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <Link to="/products" className="bg-primary-container text-on-primary-container font-headline font-bold px-6 py-3 rounded-lg text-xs uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all no-underline">
          Teclados Custom
        </Link>
        <Link to="/raspi" className="border border-outline-variant/30 text-on-surface-variant font-headline font-bold px-6 py-3 rounded-lg text-xs uppercase tracking-widest hover:bg-surface-container-high transition-all no-underline">
          Raspberry Pi
        </Link>
      </div>
    </div>
  </main>
);

export default About;

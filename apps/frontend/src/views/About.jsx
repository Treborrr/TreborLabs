import { useState } from 'react';
import { Link } from 'react-router-dom';
import SEOMeta from '../components/SEOMeta';

const About = () => {
  return (
    <main className="bg-surface text-on-surface min-h-screen">
      <SEOMeta
        title="Sobre Nosotros — Trebor Labs"
        description="Conoce la historia y misión de Trebor Labs. Somos un laboratorio de hardware para el artesano digital."
      />

      {/* Hero */}
      <section className="relative pt-40 pb-24 px-8 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-30">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <p className="font-mono text-primary text-xs tracking-widest uppercase mb-4">Trebor Labs · Est. 2024</p>
          <h1 className="font-headline text-5xl md:text-7xl font-black tracking-tighter mb-8">
            El laboratorio del <span className="text-primary italic">artesano digital.</span>
          </h1>
          <p className="text-on-surface-variant text-xl max-w-2xl mx-auto leading-relaxed">
            Creemos que las herramientas con las que interactúas cada día deben ser tan precisas como el código que escribes.
          </p>
        </div>
      </section>

      {/* Misión */}
      <section className="py-20 px-8 bg-surface-container-low">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="font-mono text-[10px] text-primary tracking-widest uppercase block mb-4">Nuestra Misión</span>
            <h2 className="font-headline text-4xl font-bold mb-6">Ingenería como arte, hardware como lenguaje.</h2>
            <div className="space-y-4 text-on-surface-variant leading-relaxed">
              <p>Desde Lima, Perú, curamos y diseñamos componentes que cierran la brecha entre la electrónica cruda y la experiencia de usuario refinada. Cada interruptor, cada PCB y cada línea de nuestro blog está pensada para el profesional que no se conforma con lo estándar.</p>
              <p>No somos solo una tienda de hardware; somos un laboratorio para el creador inconformista. Partimos de la premisa de que el hardware premium no debería estar reservado solo para mercados anglófonos.</p>
            </div>
            <Link to="/contact" className="inline-flex items-center gap-3 mt-8 group no-underline">
              <span className="w-10 h-[1px] bg-primary group-hover:w-16 transition-all"></span>
              <span className="font-headline font-bold uppercase tracking-widest text-sm text-primary">Contáctanos</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: 'keyboard', label: 'Teclados Custom', desc: 'Diseñados para el tacto perfecto' },
              { icon: 'memory', label: 'Raspberry Pi', desc: 'SBCs para todo proyecto' },
              { icon: 'build', label: 'Build Guides', desc: 'Documentación técnica premium' },
              { icon: 'verified', label: 'Calidad Probada', desc: 'Cada unidad verificada' },
            ].map(item => (
              <div key={item.icon} className="bg-surface-container rounded-xl p-6 border border-outline/10 hover:border-primary/30 transition-colors">
                <span className="material-symbols-outlined text-primary text-3xl block mb-3">{item.icon}</span>
                <p className="font-bold text-sm text-on-surface mb-1">{item.label}</p>
                <p className="text-xs text-on-surface-variant">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-20 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-mono text-[10px] text-primary tracking-widest uppercase mb-4">Por qué existimos</p>
            <h2 className="font-headline text-4xl font-bold">Nuestros valores fundamentales</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: 'precision_manufacturing', title: 'Precisión', desc: 'No entregamos lo aproximadamente correcto. Cada producto pasa por pruebas de calidad antes de llegar a tus manos.' },
              { icon: 'groups', title: 'Comunidad', desc: 'Construimos para makers, devs y entusiastas. Nuestro blog y tutoriales son parte del mismo producto.' },
              { icon: 'local_fire_department', title: 'Pasión', desc: 'Somos usuarios de nuestro propio hardware. Diseñamos aquello que nosotros mismos queremos usar.' },
            ].map(v => (
              <div key={v.title} className="bg-surface-container rounded-xl p-8 border border-outline/10">
                <span className="material-symbols-outlined text-primary text-4xl mb-4 block">{v.icon}</span>
                <h3 className="font-headline font-bold text-xl mb-3">{v.title}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-8 bg-primary-container/10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-headline text-4xl font-bold mb-6">¿Listo para elevar tu setup?</h2>
          <p className="text-on-surface-variant mb-8">Explora nuestra colección de teclados mecánicos y kits Raspberry Pi.</p>
          <div className="flex gap-4 justify-center">
            <Link to="/products" className="px-8 py-4 bg-primary text-on-primary rounded-md font-bold hover:opacity-90 transition-opacity no-underline">Ver Productos</Link>
            <Link to="/contact" className="px-8 py-4 bg-surface-container text-on-surface rounded-md font-bold border border-outline/20 hover:border-primary/40 transition-colors no-underline">Contactar</Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;

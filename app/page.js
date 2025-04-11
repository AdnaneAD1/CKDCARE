'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Heart, Brain, Activity, Shield, ArrowRight } from 'lucide-react'
import Image from 'next/image'

const features = [
  {
    icon: Heart,
    title: "Suivi Personnalisé",
    description: "Surveillance continue de l'évolution de la maladie rénale chronique avec des alertes en temps réel."
  },
  {
    icon: Brain,
    title: "IA Prédictive",
    description: "Algorithmes avancés pour prédire les risques et optimiser les traitements."
  },
  {
    icon: Activity,
    title: "Données en Temps Réel",
    description: "Visualisation instantanée des paramètres cliniques et biologiques."
  },
  {
    icon: Shield,
    title: "Sécurité Maximale",
    description: "Protection des données médicales selon les normes les plus strictes."
  }
]

const FeatureCard = ({ icon: Icon, title, description, index }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.2 }}
      className="bg-card p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
    >
      <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  )
}

export default function HomePage() {
  const [heroRef, heroInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  const [statsRef, statsInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.div
        ref={heroRef}
        initial={{ opacity: 0 }}
        animate={heroInView ? { opacity: 1 } : {}}
        transition={{ duration: 1 }}
        className="relative h-screen flex items-center justify-center"
      >
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&q=80"
            alt="Medical background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/90 to-background/95 backdrop-blur-sm" />
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.h1
            initial={{ y: 20 }}
            animate={heroInView ? { y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold mb-6 text-white"
          >
            CKDCARE
          </motion.h1>
          <motion.p
            initial={{ y: 20 }}
            animate={heroInView ? { y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto"
          >
            La plateforme innovante pour le suivi des patients atteints de maladie rénale chronique
          </motion.p>
          <motion.div
            initial={{ y: 20 }}
            animate={heroInView ? { y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Link href="/login">
              <Button size="lg" className="text-lg px-8 bg-white text-primary hover:bg-white/90">
                Accéder à la plateforme
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={heroInView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.8 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <div className="animate-bounce">
            <ArrowRight className="h-6 w-6 transform rotate-90 text-white" />
          </div>
        </motion.div>
      </motion.div>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Une Solution Complète pour le Suivi des Patients
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <motion.section
        ref={statsRef}
        className="py-20 bg-primary/5"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { number: "1000+", label: "Patients Suivis" },
              { number: "50+", label: "Centres Médicaux" },
              { number: "95%", label: "Satisfaction" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={statsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-card py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p> 2025 CKDCARE. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}
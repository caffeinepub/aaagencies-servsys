import { createContext, useContext, useEffect, useState } from "react";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type LangCode = "en" | "es" | "fr" | "zh" | "ar" | "pt" | "sw";

interface I18nContextValue {
  lang: LangCode;
  setLang: (lang: string) => void;
  t: (key: string) => string;
}

// ─────────────────────────────────────────────────────────────
// Translations
// ─────────────────────────────────────────────────────────────

type TranslationMap = Record<string, string>;
type Translations = Record<LangCode, TranslationMap>;

const translations: Translations = {
  en: {
    "nav.login": "Login",
    "nav.getStarted": "Get Started",
    "nav.tagline": "Ours Empowers YOurs",

    "hero.badge": "AI Agents & Agencies as a Service",
    "hero.h1_line1": "The Future of Work is",
    "hero.h1_servsys": "SerVSys™ Powered",
    "hero.h1_with": "with",
    "hero.h1_finfracfran": "FinFracFran™",
    "hero.subheadline":
      "An AI-driven, multi-tenant platform for multi-agent operations, financial fractionalization, and equitable wealth distribution. Built for individuals, teams, and enterprises worldwide.",
    "hero.cta1": "Explore Portals",
    "hero.cta2": "Login to Dashboard",

    "features.multiAgentSwarms": "Multi-Agent Swarms",
    "features.aiFirst": "AI-First Architecture",
    "features.multiLingual": "Multi-Lingual & Global",
    "features.selfSovereign": "Self-Sovereign Identity",

    "portals.heading": "Choose Your Portal",
    "portals.subheading":
      "Three purpose-built entry points — each tailored to a different role in the SerVSys™ ecosystem.",
    "portals.enterPortal": "Enter Portal",
    "portals.a.eyebrow": "Portal A",
    "portals.a.title": "AI Agent Console",
    "portals.a.description":
      "Access AI-powered agent swarms, task routing, and intelligent automation for your business.",
    "portals.b.eyebrow": "Portal B",
    "portals.b.title": "Client & Agency Dashboard",
    "portals.b.description":
      "Manage your organization, teams, branches, wallets, and vendor memberships.",
    "portals.c.eyebrow": "Portal C",
    "portals.c.title": "Super Admin Console",
    "portals.c.description":
      "Platform-level controls, tenant provisioning, audit logs, and multi-org oversight.",

    "services.badge": "Platform Services",
    "services.heading": "Everything Your Agency Needs",
    "services.subheading":
      "Three interconnected systems — AI, Operations, and Finance — designed to work as one.",
    "services.agents.eyebrow": "AI Agents",
    "services.agents.title": "Intelligent Multi-Agent Automation",
    "services.agents.description":
      "Deploy AI agent swarms that route tasks, automate workflows, and learn from your organization's data — across any language, region, or vertical.",
    "services.agents.bullet1": "Multi-agent task routing & orchestration",
    "services.agents.bullet2": "Agent registry & lifecycle management",
    "services.agents.bullet3": "Real-time automation across departments",
    "services.agents.bullet4": "Pluggable AI models & custom logic",
    "services.servsys.eyebrow": "SerVSys™",
    "services.servsys.title": "Service as a System",
    "services.servsys.description":
      "A unified platform for multi-org, multi-vendor, multi-site, and multi-user service delivery. Run your entire agency ecosystem from a single control plane.",
    "services.servsys.bullet1": "Multi-tenant organization management",
    "services.servsys.bullet2": "Branch & site provisioning",
    "services.servsys.bullet3": "Multi-vendor & multi-wallet support",
    "services.servsys.bullet4": "Role-scoped access across all teams",
    "services.finfracfran.eyebrow": "FinFracFran™",
    "services.finfracfran.title": "Financial Fractionalization & Franchising",
    "services.finfracfran.description":
      "The FinFracFran™ framework modernizes asset ownership and wealth distribution — enabling fractional ownership, franchise models, and equitable earnings for everyone.",
    "services.finfracfran.bullet1": "Fractional asset ownership & tokenization",
    "services.finfracfran.bullet2": "Franchise licensing & royalty flows",
    "services.finfracfran.bullet3": "Equitable wealth distribution models",
    "services.finfracfran.bullet4": "Multi-wallet & payment-rail ready",

    "pricing.badge": "Pricing",
    "pricing.heading": "Plans for Every Scale",
    "pricing.subheading":
      "From solo explorers to global enterprises — SerVSys™ scales with you.",
    "pricing.recommended": "Recommended",
    "pricing.forever": "forever",
    "pricing.perMonth": "/ month",
    "pricing.free.name": "Free",
    "pricing.free.description": "Explore the platform with no commitment.",
    "pricing.free.cta": "Get Started Free",
    "pricing.free.f1": "1 organization",
    "pricing.free.f2": "Up to 3 users",
    "pricing.free.f3": "1 AI agent slot",
    "pricing.free.f4": "Basic task management",
    "pricing.free.f5": "Community support",
    "pricing.starter.name": "Starter",
    "pricing.starter.description": "For small teams and growing agencies.",
    "pricing.starter.cta": "Request Early Access",
    "pricing.starter.f1": "3 organizations",
    "pricing.starter.f2": "Up to 20 users",
    "pricing.starter.f3": "5 AI agent slots",
    "pricing.starter.f4": "Invite link onboarding",
    "pricing.starter.f5": "Multi-wallet support",
    "pricing.starter.f6": "Email support",
    "pricing.professional.name": "Professional",
    "pricing.professional.description":
      "Full-featured for established agencies.",
    "pricing.professional.cta": "Get Professional",
    "pricing.professional.f1": "Unlimited organizations",
    "pricing.professional.f2": "Unlimited users",
    "pricing.professional.f3": "25 AI agent slots",
    "pricing.professional.f4": "SerVSys™ multi-site ops",
    "pricing.professional.f5": "FinFracFran™ framework",
    "pricing.professional.f6": "Branch & vendor management",
    "pricing.professional.f7": "Priority support",
    "pricing.professional.f8": "API access",
    "pricing.enterprise.name": "Enterprise",
    "pricing.enterprise.description":
      "Tailored for large-scale, multi-tenant deployments.",
    "pricing.enterprise.cta": "Contact Sales",
    "pricing.enterprise.f1": "Unlimited everything",
    "pricing.enterprise.f2": "White-label options",
    "pricing.enterprise.f3": "Dedicated PaaS tenant",
    "pricing.enterprise.f4": "Custom AI agent quota",
    "pricing.enterprise.f5": "SLA & compliance",
    "pricing.enterprise.f6": "Dedicated account manager",
    "pricing.enterprise.f7": "Webhook & audit log access",

    "lead.heading": "Get Early Access",
    "lead.subheading":
      "Be among the first to experience the full SerVSys™ platform. Share your interest and we'll reach out with priority onboarding.",
    "lead.form.nameLbl": "Name",
    "lead.form.namePlaceholder": "Your full name",
    "lead.form.nameRequired": "Name is required",
    "lead.form.emailLbl": "Email",
    "lead.form.emailPlaceholder": "you@example.com",
    "lead.form.emailRequired": "Email is required",
    "lead.form.emailInvalid": "Please enter a valid email address",
    "lead.form.orgLbl": "Organization",
    "lead.form.orgOptional": "(optional)",
    "lead.form.orgPlaceholder": "Your company or org name",
    "lead.form.roleLbl": "Role / Interest",
    "lead.form.rolePlaceholder": "Select your role",
    "lead.form.roleRequired": "Please select your role or interest",
    "lead.form.role.individual": "Individual",
    "lead.form.role.agency": "Agency",
    "lead.form.role.enterprise": "Enterprise",
    "lead.form.role.developer": "Developer",
    "lead.form.role.partner": "Partner",
    "lead.form.interestLbl": "Message / Interest",
    "lead.form.interestPlaceholder":
      "Tell us what you're looking to build or explore...",
    "lead.form.interestRequired": "Please share a brief message",
    "lead.form.submit": "Request Early Access",
    "lead.form.submitting": "Submitting...",
    "lead.success.heading": "You're on the list!",
    "lead.success.body":
      "We'll reach out soon with early access details. Welcome to the AAAgencies community.",

    "footer.brand.description":
      "AI Agents & Agencies as a Service. Transforming how organizations operate through intelligent automation and financial fractionalization.",
    "footer.brand.mission1": "You Be Your Best",
    "footer.brand.mission2": "Self Sovereign Always & In All Ways",
    "footer.platform": "Platform",
    "footer.portals": "Portals",
    "footer.company": "Company",
    "footer.links.about": "About",
    "footer.links.services": "Services",
    "footer.links.apiDocs": "API Docs",
    "footer.links.pricing": "Pricing",
    "footer.links.aiAgentConsole": "AI Agent Console",
    "footer.links.agencyDashboard": "Agency Dashboard",
    "footer.links.adminConsole": "Admin Console",
    "footer.links.contact": "Contact",
    "footer.links.blog": "Blog",
    "footer.links.careers": "Careers",
    "footer.links.press": "Press",
    "footer.copyright":
      "AAAgencies SerVSys™. All rights reserved. FinFracFran™ Framework.",
  },

  es: {
    "nav.login": "Iniciar sesión",
    "nav.getStarted": "Comenzar",
    "nav.tagline": "Lo Nuestro Empodera lo Tuyo",

    "hero.badge": "Agentes y Agencias de IA como Servicio",
    "hero.h1_line1": "El Futuro del Trabajo es",
    "hero.h1_servsys": "Impulsado por SerVSys™",
    "hero.h1_with": "con",
    "hero.h1_finfracfran": "FinFracFran™",
    "hero.subheadline":
      "Una plataforma multi-tenant impulsada por IA para operaciones multi-agente, fraccionamiento financiero y distribución equitativa de riqueza. Diseñada para individuos, equipos y empresas en todo el mundo.",
    "hero.cta1": "Explorar Portales",
    "hero.cta2": "Ir al Panel",

    "features.multiAgentSwarms": "Enjambres Multi-Agente",
    "features.aiFirst": "Arquitectura IA-Primero",
    "features.multiLingual": "Multilingüe y Global",
    "features.selfSovereign": "Identidad Soberana",

    "portals.heading": "Elige Tu Portal",
    "portals.subheading":
      "Tres puntos de entrada específicos — cada uno adaptado a un rol diferente en el ecosistema SerVSys™.",
    "portals.enterPortal": "Entrar al Portal",
    "portals.a.eyebrow": "Portal A",
    "portals.a.title": "Consola de Agentes IA",
    "portals.a.description":
      "Accede a enjambres de agentes IA, enrutamiento de tareas y automatización inteligente para tu negocio.",
    "portals.b.eyebrow": "Portal B",
    "portals.b.title": "Panel de Cliente y Agencia",
    "portals.b.description":
      "Gestiona tu organización, equipos, sucursales, billeteras y membresías de proveedores.",
    "portals.c.eyebrow": "Portal C",
    "portals.c.title": "Consola de Super Admin",
    "portals.c.description":
      "Controles a nivel de plataforma, aprovisionamiento de inquilinos, registros de auditoría y supervisión multi-org.",

    "services.badge": "Servicios de Plataforma",
    "services.heading": "Todo lo que Tu Agencia Necesita",
    "services.subheading":
      "Tres sistemas interconectados — IA, Operaciones y Finanzas — diseñados para funcionar como uno.",
    "services.agents.eyebrow": "Agentes IA",
    "services.agents.title": "Automatización Inteligente Multi-Agente",
    "services.agents.description":
      "Despliega enjambres de agentes IA que enrutan tareas, automatizan flujos de trabajo y aprenden de los datos de tu organización.",
    "services.agents.bullet1": "Enrutamiento y orquestación multi-agente",
    "services.agents.bullet2":
      "Registro y gestión del ciclo de vida de agentes",
    "services.agents.bullet3":
      "Automatización en tiempo real entre departamentos",
    "services.agents.bullet4": "Modelos IA conectables y lógica personalizada",
    "services.servsys.eyebrow": "SerVSys™",
    "services.servsys.title": "Servicio como Sistema",
    "services.servsys.description":
      "Una plataforma unificada para entrega de servicios multi-org, multi-proveedor, multi-sitio y multi-usuario.",
    "services.servsys.bullet1": "Gestión de organizaciones multi-tenant",
    "services.servsys.bullet2": "Aprovisionamiento de sucursales y sitios",
    "services.servsys.bullet3": "Soporte multi-proveedor y multi-billetera",
    "services.servsys.bullet4": "Acceso por roles en todos los equipos",
    "services.finfracfran.eyebrow": "FinFracFran™",
    "services.finfracfran.title": "Fraccionamiento Financiero y Franquicias",
    "services.finfracfran.description":
      "El framework FinFracFran™ moderniza la propiedad de activos y la distribución de riqueza.",
    "services.finfracfran.bullet1":
      "Propiedad fraccionada y tokenización de activos",
    "services.finfracfran.bullet2":
      "Licencias de franquicia y flujos de regalías",
    "services.finfracfran.bullet3":
      "Modelos de distribución equitativa de riqueza",
    "services.finfracfran.bullet4": "Multi-billetera y redes de pago listas",

    "pricing.badge": "Precios",
    "pricing.heading": "Planes para Cada Escala",
    "pricing.subheading":
      "Desde exploradores individuales hasta empresas globales — SerVSys™ crece contigo.",
    "pricing.recommended": "Recomendado",
    "pricing.forever": "para siempre",
    "pricing.perMonth": "/ mes",
    "pricing.free.name": "Gratis",
    "pricing.free.description": "Explora la plataforma sin compromiso.",
    "pricing.free.cta": "Comenzar Gratis",
    "pricing.free.f1": "1 organización",
    "pricing.free.f2": "Hasta 3 usuarios",
    "pricing.free.f3": "1 slot de agente IA",
    "pricing.free.f4": "Gestión básica de tareas",
    "pricing.free.f5": "Soporte comunitario",
    "pricing.starter.name": "Inicial",
    "pricing.starter.description":
      "Para pequeños equipos y agencias en crecimiento.",
    "pricing.starter.cta": "Solicitar Acceso Anticipado",
    "pricing.starter.f1": "3 organizaciones",
    "pricing.starter.f2": "Hasta 20 usuarios",
    "pricing.starter.f3": "5 slots de agentes IA",
    "pricing.starter.f4": "Incorporación por enlace de invitación",
    "pricing.starter.f5": "Soporte multi-billetera",
    "pricing.starter.f6": "Soporte por correo",
    "pricing.professional.name": "Profesional",
    "pricing.professional.description": "Completo para agencias establecidas.",
    "pricing.professional.cta": "Obtener Profesional",
    "pricing.professional.f1": "Organizaciones ilimitadas",
    "pricing.professional.f2": "Usuarios ilimitados",
    "pricing.professional.f3": "25 slots de agentes IA",
    "pricing.professional.f4": "Operaciones multi-sitio SerVSys™",
    "pricing.professional.f5": "Framework FinFracFran™",
    "pricing.professional.f6": "Gestión de sucursales y proveedores",
    "pricing.professional.f7": "Soporte prioritario",
    "pricing.professional.f8": "Acceso API",
    "pricing.enterprise.name": "Empresarial",
    "pricing.enterprise.description":
      "Adaptado para despliegues multi-tenant a gran escala.",
    "pricing.enterprise.cta": "Contactar Ventas",
    "pricing.enterprise.f1": "Todo ilimitado",
    "pricing.enterprise.f2": "Opciones de marca blanca",
    "pricing.enterprise.f3": "Tenant PaaS dedicado",
    "pricing.enterprise.f4": "Cuota de agentes IA personalizada",
    "pricing.enterprise.f5": "SLA y cumplimiento",
    "pricing.enterprise.f6": "Gestor de cuenta dedicado",
    "pricing.enterprise.f7": "Acceso a webhooks y registros de auditoría",

    "lead.heading": "Obtén Acceso Anticipado",
    "lead.subheading":
      "Sé de los primeros en experimentar la plataforma SerVSys™. Comparte tu interés y te contactaremos con incorporación prioritaria.",
    "lead.form.nameLbl": "Nombre",
    "lead.form.namePlaceholder": "Tu nombre completo",
    "lead.form.nameRequired": "El nombre es obligatorio",
    "lead.form.emailLbl": "Correo electrónico",
    "lead.form.emailPlaceholder": "tu@ejemplo.com",
    "lead.form.emailRequired": "El correo es obligatorio",
    "lead.form.emailInvalid": "Por favor ingresa un correo válido",
    "lead.form.orgLbl": "Organización",
    "lead.form.orgOptional": "(opcional)",
    "lead.form.orgPlaceholder": "Tu empresa u organización",
    "lead.form.roleLbl": "Rol / Interés",
    "lead.form.rolePlaceholder": "Selecciona tu rol",
    "lead.form.roleRequired": "Por favor selecciona tu rol o interés",
    "lead.form.role.individual": "Individual",
    "lead.form.role.agency": "Agencia",
    "lead.form.role.enterprise": "Empresa",
    "lead.form.role.developer": "Desarrollador",
    "lead.form.role.partner": "Socio",
    "lead.form.interestLbl": "Mensaje / Interés",
    "lead.form.interestPlaceholder":
      "Cuéntanos qué deseas construir o explorar...",
    "lead.form.interestRequired": "Por favor comparte un mensaje breve",
    "lead.form.submit": "Solicitar Acceso Anticipado",
    "lead.form.submitting": "Enviando...",
    "lead.success.heading": "¡Estás en la lista!",
    "lead.success.body":
      "Nos pondremos en contacto pronto con detalles de acceso anticipado. Bienvenido a la comunidad AAAgencies.",

    "footer.brand.description":
      "Agentes y Agencias de IA como Servicio. Transformando cómo operan las organizaciones mediante automatización inteligente.",
    "footer.brand.mission1": "Sé Tu Mejor Versión",
    "footer.brand.mission2": "Soberano Siempre y en Todo",
    "footer.platform": "Plataforma",
    "footer.portals": "Portales",
    "footer.company": "Empresa",
    "footer.links.about": "Acerca de",
    "footer.links.services": "Servicios",
    "footer.links.apiDocs": "Docs API",
    "footer.links.pricing": "Precios",
    "footer.links.aiAgentConsole": "Consola de Agentes IA",
    "footer.links.agencyDashboard": "Panel de Agencia",
    "footer.links.adminConsole": "Consola Admin",
    "footer.links.contact": "Contacto",
    "footer.links.blog": "Blog",
    "footer.links.careers": "Empleos",
    "footer.links.press": "Prensa",
    "footer.copyright":
      "AAAgencies SerVSys™. Todos los derechos reservados. Framework FinFracFran™.",
  },

  fr: {
    "nav.login": "Connexion",
    "nav.getStarted": "Commencer",
    "nav.tagline": "Le Nôtre Renforce le Vôtre",

    "hero.badge": "Agents et Agences IA en tant que Service",
    "hero.h1_line1": "L'Avenir du Travail est",
    "hero.h1_servsys": "Propulsé par SerVSys™",
    "hero.h1_with": "avec",
    "hero.h1_finfracfran": "FinFracFran™",
    "hero.subheadline":
      "Une plateforme multi-tenant pilotée par l'IA pour les opérations multi-agents, la fractionalisation financière et la distribution équitable des richesses.",
    "hero.cta1": "Explorer les Portails",
    "hero.cta2": "Accéder au Tableau de Bord",

    "features.multiAgentSwarms": "Essaims Multi-Agents",
    "features.aiFirst": "Architecture IA en Premier",
    "features.multiLingual": "Multilingue & Global",
    "features.selfSovereign": "Identité Auto-Souveraine",

    "portals.heading": "Choisissez Votre Portail",
    "portals.subheading":
      "Trois points d'entrée dédiés — chacun adapté à un rôle différent dans l'écosystème SerVSys™.",
    "portals.enterPortal": "Entrer dans le Portail",
    "portals.a.eyebrow": "Portail A",
    "portals.a.title": "Console des Agents IA",
    "portals.a.description":
      "Accédez aux essaims d'agents IA, au routage des tâches et à l'automatisation intelligente pour votre entreprise.",
    "portals.b.eyebrow": "Portail B",
    "portals.b.title": "Tableau de Bord Client & Agence",
    "portals.b.description":
      "Gérez votre organisation, vos équipes, vos succursales, vos portefeuilles et vos abonnements fournisseurs.",
    "portals.c.eyebrow": "Portail C",
    "portals.c.title": "Console Super Admin",
    "portals.c.description":
      "Contrôles au niveau de la plateforme, provisionnement des locataires, journaux d'audit et supervision multi-org.",

    "services.badge": "Services de la Plateforme",
    "services.heading": "Tout ce dont Votre Agence a Besoin",
    "services.subheading":
      "Trois systèmes interconnectés — IA, Opérations et Finance — conçus pour fonctionner ensemble.",
    "services.agents.eyebrow": "Agents IA",
    "services.agents.title": "Automatisation Intelligente Multi-Agents",
    "services.agents.description":
      "Déployez des essaims d'agents IA qui routent les tâches, automatisent les flux de travail et apprennent des données de votre organisation.",
    "services.agents.bullet1": "Routage et orchestration multi-agents",
    "services.agents.bullet2": "Registre et gestion du cycle de vie des agents",
    "services.agents.bullet3":
      "Automatisation en temps réel entre départements",
    "services.agents.bullet4":
      "Modèles IA connectables et logique personnalisée",
    "services.servsys.eyebrow": "SerVSys™",
    "services.servsys.title": "Le Service en tant que Système",
    "services.servsys.description":
      "Une plateforme unifiée pour la prestation de services multi-org, multi-fournisseur, multi-site et multi-utilisateur.",
    "services.servsys.bullet1": "Gestion d'organisations multi-tenant",
    "services.servsys.bullet2": "Provisionnement de succursales et sites",
    "services.servsys.bullet3":
      "Support multi-fournisseur et multi-portefeuille",
    "services.servsys.bullet4": "Accès par rôles dans toutes les équipes",
    "services.finfracfran.eyebrow": "FinFracFran™",
    "services.finfracfran.title": "Fractionnement Financier & Franchisage",
    "services.finfracfran.description":
      "Le framework FinFracFran™ modernise la propriété des actifs et la distribution des richesses.",
    "services.finfracfran.bullet1":
      "Propriété fractionnée et tokenisation d'actifs",
    "services.finfracfran.bullet2":
      "Licences de franchise et flux de redevances",
    "services.finfracfran.bullet3":
      "Modèles de distribution équitable des richesses",
    "services.finfracfran.bullet4":
      "Multi-portefeuille et rails de paiement prêts",

    "pricing.badge": "Tarification",
    "pricing.heading": "Des Plans pour Toutes les Échelles",
    "pricing.subheading":
      "Des explorateurs individuels aux entreprises mondiales — SerVSys™ évolue avec vous.",
    "pricing.recommended": "Recommandé",
    "pricing.forever": "pour toujours",
    "pricing.perMonth": "/ mois",
    "pricing.free.name": "Gratuit",
    "pricing.free.description": "Explorez la plateforme sans engagement.",
    "pricing.free.cta": "Démarrer Gratuitement",
    "pricing.free.f1": "1 organisation",
    "pricing.free.f2": "Jusqu'à 3 utilisateurs",
    "pricing.free.f3": "1 slot d'agent IA",
    "pricing.free.f4": "Gestion de tâches de base",
    "pricing.free.f5": "Support communautaire",
    "pricing.starter.name": "Débutant",
    "pricing.starter.description":
      "Pour les petites équipes et les agences en croissance.",
    "pricing.starter.cta": "Demander un Accès Anticipé",
    "pricing.starter.f1": "3 organisations",
    "pricing.starter.f2": "Jusqu'à 20 utilisateurs",
    "pricing.starter.f3": "5 slots d'agents IA",
    "pricing.starter.f4": "Intégration par lien d'invitation",
    "pricing.starter.f5": "Support multi-portefeuille",
    "pricing.starter.f6": "Support par e-mail",
    "pricing.professional.name": "Professionnel",
    "pricing.professional.description": "Complet pour les agences établies.",
    "pricing.professional.cta": "Obtenir le Professionnel",
    "pricing.professional.f1": "Organisations illimitées",
    "pricing.professional.f2": "Utilisateurs illimités",
    "pricing.professional.f3": "25 slots d'agents IA",
    "pricing.professional.f4": "Opérations multi-sites SerVSys™",
    "pricing.professional.f5": "Framework FinFracFran™",
    "pricing.professional.f6": "Gestion des succursales et fournisseurs",
    "pricing.professional.f7": "Support prioritaire",
    "pricing.professional.f8": "Accès API",
    "pricing.enterprise.name": "Entreprise",
    "pricing.enterprise.description":
      "Adapté aux déploiements multi-tenant à grande échelle.",
    "pricing.enterprise.cta": "Contacter les Ventes",
    "pricing.enterprise.f1": "Tout illimité",
    "pricing.enterprise.f2": "Options marque blanche",
    "pricing.enterprise.f3": "Tenant PaaS dédié",
    "pricing.enterprise.f4": "Quota d'agents IA personnalisé",
    "pricing.enterprise.f5": "SLA & conformité",
    "pricing.enterprise.f6": "Gestionnaire de compte dédié",
    "pricing.enterprise.f7": "Accès webhooks et journaux d'audit",

    "lead.heading": "Obtenez un Accès Anticipé",
    "lead.subheading":
      "Soyez parmi les premiers à découvrir la plateforme SerVSys™. Partagez votre intérêt et nous vous contacterons.",
    "lead.form.nameLbl": "Nom",
    "lead.form.namePlaceholder": "Votre nom complet",
    "lead.form.nameRequired": "Le nom est obligatoire",
    "lead.form.emailLbl": "E-mail",
    "lead.form.emailPlaceholder": "vous@exemple.com",
    "lead.form.emailRequired": "L'e-mail est obligatoire",
    "lead.form.emailInvalid": "Veuillez entrer une adresse e-mail valide",
    "lead.form.orgLbl": "Organisation",
    "lead.form.orgOptional": "(facultatif)",
    "lead.form.orgPlaceholder": "Votre entreprise ou organisation",
    "lead.form.roleLbl": "Rôle / Intérêt",
    "lead.form.rolePlaceholder": "Sélectionnez votre rôle",
    "lead.form.roleRequired": "Veuillez sélectionner votre rôle ou intérêt",
    "lead.form.role.individual": "Individuel",
    "lead.form.role.agency": "Agence",
    "lead.form.role.enterprise": "Entreprise",
    "lead.form.role.developer": "Développeur",
    "lead.form.role.partner": "Partenaire",
    "lead.form.interestLbl": "Message / Intérêt",
    "lead.form.interestPlaceholder":
      "Dites-nous ce que vous souhaitez construire ou explorer...",
    "lead.form.interestRequired": "Veuillez partager un bref message",
    "lead.form.submit": "Demander un Accès Anticipé",
    "lead.form.submitting": "Envoi en cours...",
    "lead.success.heading": "Vous êtes sur la liste !",
    "lead.success.body":
      "Nous vous contacterons bientôt avec les détails d'accès anticipé. Bienvenue dans la communauté AAAgencies.",

    "footer.brand.description":
      "Agents et Agences IA en tant que Service. Transformer le fonctionnement des organisations grâce à l'automatisation intelligente.",
    "footer.brand.mission1": "Soyez le Meilleur de Vous-Même",
    "footer.brand.mission2": "Souverain Toujours et en Tout",
    "footer.platform": "Plateforme",
    "footer.portals": "Portails",
    "footer.company": "Entreprise",
    "footer.links.about": "À propos",
    "footer.links.services": "Services",
    "footer.links.apiDocs": "Docs API",
    "footer.links.pricing": "Tarification",
    "footer.links.aiAgentConsole": "Console Agents IA",
    "footer.links.agencyDashboard": "Tableau de Bord Agence",
    "footer.links.adminConsole": "Console Admin",
    "footer.links.contact": "Contact",
    "footer.links.blog": "Blog",
    "footer.links.careers": "Carrières",
    "footer.links.press": "Presse",
    "footer.copyright":
      "AAAgencies SerVSys™. Tous droits réservés. Framework FinFracFran™.",
  },

  zh: {
    "nav.login": "登录",
    "nav.getStarted": "立即开始",
    "nav.tagline": "我们赋能您",

    "hero.badge": "AI智能体与机构即服务",
    "hero.h1_line1": "工作的未来是",
    "hero.h1_servsys": "SerVSys™驱动",
    "hero.h1_with": "结合",
    "hero.h1_finfracfran": "FinFracFran™",
    "hero.subheadline":
      "一个AI驱动的多租户平台，支持多智能体操作、金融分级化和公平财富分配。专为全球个人、团队和企业打造。",
    "hero.cta1": "探索门户",
    "hero.cta2": "登录控制台",

    "features.multiAgentSwarms": "多智能体集群",
    "features.aiFirst": "AI优先架构",
    "features.multiLingual": "多语言与全球化",
    "features.selfSovereign": "自主主权身份",

    "portals.heading": "选择您的门户",
    "portals.subheading":
      "三个专门入口——每个都针对SerVSys™生态系统中的不同角色。",
    "portals.enterPortal": "进入门户",
    "portals.a.eyebrow": "门户A",
    "portals.a.title": "AI智能体控制台",
    "portals.a.description": "访问AI驱动的智能体集群、任务路由和业务自动化。",
    "portals.b.eyebrow": "门户B",
    "portals.b.title": "客户与机构控制台",
    "portals.b.description":
      "管理您的组织、团队、分支机构、钱包和供应商会员资格。",
    "portals.c.eyebrow": "门户C",
    "portals.c.title": "超级管理控制台",
    "portals.c.description": "平台级控制、租户配置、审计日志和多组织监管。",

    "services.badge": "平台服务",
    "services.heading": "您的机构所需的一切",
    "services.subheading": "三个互联系统——AI、运营和财务——协同运作。",
    "services.agents.eyebrow": "AI智能体",
    "services.agents.title": "智能多智能体自动化",
    "services.agents.description":
      "部署AI智能体集群，自动路由任务、优化工作流，并从组织数据中学习。",
    "services.agents.bullet1": "多智能体任务路由与编排",
    "services.agents.bullet2": "智能体注册与生命周期管理",
    "services.agents.bullet3": "跨部门实时自动化",
    "services.agents.bullet4": "可插拔AI模型与自定义逻辑",
    "services.servsys.eyebrow": "SerVSys™",
    "services.servsys.title": "服务即系统",
    "services.servsys.description":
      "统一平台，支持多组织、多供应商、多站点和多用户的服务交付。",
    "services.servsys.bullet1": "多租户组织管理",
    "services.servsys.bullet2": "分支机构与站点配置",
    "services.servsys.bullet3": "多供应商与多钱包支持",
    "services.servsys.bullet4": "跨团队基于角色的访问控制",
    "services.finfracfran.eyebrow": "FinFracFran™",
    "services.finfracfran.title": "金融分级化与特许经营",
    "services.finfracfran.description":
      "FinFracFran™框架现代化资产所有权和财富分配——实现分级所有权、特许模式和公平收益。",
    "services.finfracfran.bullet1": "分级资产所有权与代币化",
    "services.finfracfran.bullet2": "特许经营许可与版税流",
    "services.finfracfran.bullet3": "公平财富分配模式",
    "services.finfracfran.bullet4": "多钱包与支付轨道就绪",

    "pricing.badge": "定价",
    "pricing.heading": "适合各种规模的方案",
    "pricing.subheading": "从个人探索者到全球企业——SerVSys™与您共同成长。",
    "pricing.recommended": "推荐",
    "pricing.forever": "永久",
    "pricing.perMonth": "/ 月",
    "pricing.free.name": "免费",
    "pricing.free.description": "无需承诺，探索平台。",
    "pricing.free.cta": "免费开始",
    "pricing.free.f1": "1个组织",
    "pricing.free.f2": "最多3名用户",
    "pricing.free.f3": "1个AI智能体槽位",
    "pricing.free.f4": "基础任务管理",
    "pricing.free.f5": "社区支持",
    "pricing.starter.name": "入门",
    "pricing.starter.description": "适合小型团队和成长中的机构。",
    "pricing.starter.cta": "申请提前访问",
    "pricing.starter.f1": "3个组织",
    "pricing.starter.f2": "最多20名用户",
    "pricing.starter.f3": "5个AI智能体槽位",
    "pricing.starter.f4": "邀请链接入职",
    "pricing.starter.f5": "多钱包支持",
    "pricing.starter.f6": "邮件支持",
    "pricing.professional.name": "专业版",
    "pricing.professional.description": "成熟机构的全功能方案。",
    "pricing.professional.cta": "获取专业版",
    "pricing.professional.f1": "无限组织",
    "pricing.professional.f2": "无限用户",
    "pricing.professional.f3": "25个AI智能体槽位",
    "pricing.professional.f4": "SerVSys™多站点运营",
    "pricing.professional.f5": "FinFracFran™框架",
    "pricing.professional.f6": "分支机构与供应商管理",
    "pricing.professional.f7": "优先支持",
    "pricing.professional.f8": "API访问",
    "pricing.enterprise.name": "企业版",
    "pricing.enterprise.description": "专为大规模多租户部署量身定制。",
    "pricing.enterprise.cta": "联系销售",
    "pricing.enterprise.f1": "无限一切",
    "pricing.enterprise.f2": "白标选项",
    "pricing.enterprise.f3": "专用PaaS租户",
    "pricing.enterprise.f4": "自定义AI智能体配额",
    "pricing.enterprise.f5": "SLA与合规",
    "pricing.enterprise.f6": "专属客户经理",
    "pricing.enterprise.f7": "Webhook与审计日志访问",

    "lead.heading": "获取提前访问权限",
    "lead.subheading":
      "成为首批体验SerVSys™平台的用户，分享您的兴趣，我们将优先联系您。",
    "lead.form.nameLbl": "姓名",
    "lead.form.namePlaceholder": "您的全名",
    "lead.form.nameRequired": "姓名为必填项",
    "lead.form.emailLbl": "电子邮件",
    "lead.form.emailPlaceholder": "you@example.com",
    "lead.form.emailRequired": "电子邮件为必填项",
    "lead.form.emailInvalid": "请输入有效的电子邮件地址",
    "lead.form.orgLbl": "组织",
    "lead.form.orgOptional": "（可选）",
    "lead.form.orgPlaceholder": "您的公司或组织名称",
    "lead.form.roleLbl": "角色 / 兴趣",
    "lead.form.rolePlaceholder": "选择您的角色",
    "lead.form.roleRequired": "请选择您的角色或兴趣",
    "lead.form.role.individual": "个人",
    "lead.form.role.agency": "机构",
    "lead.form.role.enterprise": "企业",
    "lead.form.role.developer": "开发者",
    "lead.form.role.partner": "合作伙伴",
    "lead.form.interestLbl": "留言 / 兴趣",
    "lead.form.interestPlaceholder": "告诉我们您想构建或探索的内容...",
    "lead.form.interestRequired": "请分享简短留言",
    "lead.form.submit": "申请提前访问",
    "lead.form.submitting": "提交中...",
    "lead.success.heading": "您已加入名单！",
    "lead.success.body":
      "我们将尽快与您联系提前访问详情。欢迎加入AAAgencies社区。",

    "footer.brand.description":
      "AI智能体与机构即服务。通过智能自动化和金融分级化，改变组织的运营方式。",
    "footer.brand.mission1": "成就最好的自己",
    "footer.brand.mission2": "永远自主，全面自主",
    "footer.platform": "平台",
    "footer.portals": "门户",
    "footer.company": "公司",
    "footer.links.about": "关于",
    "footer.links.services": "服务",
    "footer.links.apiDocs": "API文档",
    "footer.links.pricing": "定价",
    "footer.links.aiAgentConsole": "AI智能体控制台",
    "footer.links.agencyDashboard": "机构控制台",
    "footer.links.adminConsole": "管理控制台",
    "footer.links.contact": "联系",
    "footer.links.blog": "博客",
    "footer.links.careers": "招聘",
    "footer.links.press": "新闻",
    "footer.copyright": "AAAgencies SerVSys™。保留所有权利。FinFracFran™框架。",
  },

  ar: {
    "nav.login": "تسجيل الدخول",
    "nav.getStarted": "ابدأ الآن",
    "nav.tagline": "نحن نُمكِّن أنتم",

    "hero.badge": "وكلاء ووكالات الذكاء الاصطناعي كخدمة",
    "hero.h1_line1": "مستقبل العمل هو",
    "hero.h1_servsys": "مدعوم بـ SerVSys™",
    "hero.h1_with": "مع",
    "hero.h1_finfracfran": "FinFracFran™",
    "hero.subheadline":
      "منصة متعددة المستأجرين مدعومة بالذكاء الاصطناعي لعمليات متعددة الوكلاء، والتجزئة المالية، والتوزيع العادل للثروات.",
    "hero.cta1": "استكشف البوابات",
    "hero.cta2": "تسجيل الدخول إلى لوحة التحكم",

    "features.multiAgentSwarms": "أسراب متعددة الوكلاء",
    "features.aiFirst": "بنية الذكاء الاصطناعي أولاً",
    "features.multiLingual": "متعدد اللغات وعالمي",
    "features.selfSovereign": "هوية ذاتية السيادة",

    "portals.heading": "اختر بوابتك",
    "portals.subheading":
      "ثلاث نقاط دخول مخصصة — كل منها مصمم لدور مختلف في نظام SerVSys™.",
    "portals.enterPortal": "الدخول إلى البوابة",
    "portals.a.eyebrow": "البوابة A",
    "portals.a.title": "وحدة تحكم وكلاء الذكاء الاصطناعي",
    "portals.a.description":
      "الوصول إلى أسراب وكلاء الذكاء الاصطناعي وتوجيه المهام والأتمتة الذكية.",
    "portals.b.eyebrow": "البوابة B",
    "portals.b.title": "لوحة تحكم العميل والوكالة",
    "portals.b.description":
      "إدارة مؤسستك وفرقك وفروعك ومحافظك وعضويات الموردين.",
    "portals.c.eyebrow": "البوابة C",
    "portals.c.title": "وحدة تحكم المسؤول الأعلى",
    "portals.c.description":
      "ضوابط على مستوى المنصة وتوفير المستأجرين وسجلات التدقيق والإشراف متعدد المؤسسات.",

    "services.badge": "خدمات المنصة",
    "services.heading": "كل ما تحتاجه وكالتك",
    "services.subheading":
      "ثلاثة أنظمة مترابطة — الذكاء الاصطناعي والعمليات والمال — مصممة للعمل كوحدة واحدة.",
    "services.agents.eyebrow": "وكلاء الذكاء الاصطناعي",
    "services.agents.title": "أتمتة ذكية متعددة الوكلاء",
    "services.agents.description":
      "نشر أسراب وكلاء الذكاء الاصطناعي التي توجه المهام وتؤتمت سير العمل.",
    "services.agents.bullet1": "توجيه وتنسيق متعدد الوكلاء",
    "services.agents.bullet2": "سجل الوكلاء وإدارة دورة الحياة",
    "services.agents.bullet3": "أتمتة فورية عبر الأقسام",
    "services.agents.bullet4": "نماذج ذكاء اصطناعي قابلة للتوصيل ومنطق مخصص",
    "services.servsys.eyebrow": "SerVSys™",
    "services.servsys.title": "الخدمة كنظام",
    "services.servsys.description":
      "منصة موحدة لتقديم الخدمات متعددة المؤسسات والموردين والمواقع والمستخدمين.",
    "services.servsys.bullet1": "إدارة المؤسسات متعددة المستأجرين",
    "services.servsys.bullet2": "توفير الفروع والمواقع",
    "services.servsys.bullet3": "دعم متعدد الموردين والمحافظ",
    "services.servsys.bullet4": "وصول محدد الأدوار عبر جميع الفرق",
    "services.finfracfran.eyebrow": "FinFracFran™",
    "services.finfracfran.title": "التجزئة المالية والامتياز التجاري",
    "services.finfracfran.description":
      "يُحدّث إطار FinFracFran™ ملكية الأصول وتوزيع الثروات.",
    "services.finfracfran.bullet1": "ملكية الأصول الجزئية والترميز",
    "services.finfracfran.bullet2": "ترخيص الامتياز وتدفقات الإتاوات",
    "services.finfracfran.bullet3": "نماذج التوزيع العادل للثروات",
    "services.finfracfran.bullet4": "محافظ متعددة وقضبان دفع جاهزة",

    "pricing.badge": "الأسعار",
    "pricing.heading": "خطط لكل حجم",
    "pricing.subheading":
      "من المستكشفين الأفراد إلى المؤسسات العالمية — SerVSys™ ينمو معك.",
    "pricing.recommended": "موصى به",
    "pricing.forever": "للأبد",
    "pricing.perMonth": "/ شهر",
    "pricing.free.name": "مجاني",
    "pricing.free.description": "استكشف المنصة دون التزام.",
    "pricing.free.cta": "ابدأ مجاناً",
    "pricing.free.f1": "مؤسسة واحدة",
    "pricing.free.f2": "حتى 3 مستخدمين",
    "pricing.free.f3": "فتحة وكيل ذكاء اصطناعي واحدة",
    "pricing.free.f4": "إدارة المهام الأساسية",
    "pricing.free.f5": "دعم المجتمع",
    "pricing.starter.name": "البداية",
    "pricing.starter.description": "للفرق الصغيرة والوكالات النامية.",
    "pricing.starter.cta": "طلب وصول مبكر",
    "pricing.starter.f1": "3 مؤسسات",
    "pricing.starter.f2": "حتى 20 مستخدماً",
    "pricing.starter.f3": "5 فتحات وكلاء ذكاء اصطناعي",
    "pricing.starter.f4": "الإعداد عبر رابط الدعوة",
    "pricing.starter.f5": "دعم محافظ متعددة",
    "pricing.starter.f6": "دعم بالبريد الإلكتروني",
    "pricing.professional.name": "احترافي",
    "pricing.professional.description": "كامل المزايا للوكالات الراسخة.",
    "pricing.professional.cta": "احصل على الاحترافي",
    "pricing.professional.f1": "مؤسسات غير محدودة",
    "pricing.professional.f2": "مستخدمون غير محدودون",
    "pricing.professional.f3": "25 فتحة وكيل ذكاء اصطناعي",
    "pricing.professional.f4": "عمليات متعددة المواقع SerVSys™",
    "pricing.professional.f5": "إطار FinFracFran™",
    "pricing.professional.f6": "إدارة الفروع والموردين",
    "pricing.professional.f7": "دعم ذو أولوية",
    "pricing.professional.f8": "وصول API",
    "pricing.enterprise.name": "مؤسسي",
    "pricing.enterprise.description":
      "مصمم للنشر متعدد المستأجرين على نطاق واسع.",
    "pricing.enterprise.cta": "اتصل بالمبيعات",
    "pricing.enterprise.f1": "كل شيء غير محدود",
    "pricing.enterprise.f2": "خيارات العلامة البيضاء",
    "pricing.enterprise.f3": "مستأجر PaaS مخصص",
    "pricing.enterprise.f4": "حصة وكلاء ذكاء اصطناعي مخصصة",
    "pricing.enterprise.f5": "اتفاقية مستوى الخدمة والامتثال",
    "pricing.enterprise.f6": "مدير حساب مخصص",
    "pricing.enterprise.f7": "وصول Webhook وسجلات التدقيق",

    "lead.heading": "احصل على وصول مبكر",
    "lead.subheading":
      "كن من أوائل من يختبرون منصة SerVSys™ الكاملة. شارك اهتمامك وسنتواصل معك.",
    "lead.form.nameLbl": "الاسم",
    "lead.form.namePlaceholder": "اسمك الكامل",
    "lead.form.nameRequired": "الاسم مطلوب",
    "lead.form.emailLbl": "البريد الإلكتروني",
    "lead.form.emailPlaceholder": "you@example.com",
    "lead.form.emailRequired": "البريد الإلكتروني مطلوب",
    "lead.form.emailInvalid": "يرجى إدخال عنوان بريد إلكتروني صحيح",
    "lead.form.orgLbl": "المؤسسة",
    "lead.form.orgOptional": "(اختياري)",
    "lead.form.orgPlaceholder": "اسم شركتك أو مؤسستك",
    "lead.form.roleLbl": "الدور / الاهتمام",
    "lead.form.rolePlaceholder": "اختر دورك",
    "lead.form.roleRequired": "يرجى اختيار دورك أو اهتمامك",
    "lead.form.role.individual": "فرد",
    "lead.form.role.agency": "وكالة",
    "lead.form.role.enterprise": "مؤسسة",
    "lead.form.role.developer": "مطور",
    "lead.form.role.partner": "شريك",
    "lead.form.interestLbl": "الرسالة / الاهتمام",
    "lead.form.interestPlaceholder": "أخبرنا بما تريد بناءه أو استكشافه...",
    "lead.form.interestRequired": "يرجى مشاركة رسالة مختصرة",
    "lead.form.submit": "طلب وصول مبكر",
    "lead.form.submitting": "جارٍ الإرسال...",
    "lead.success.heading": "أنت على القائمة!",
    "lead.success.body":
      "سنتواصل معك قريباً بتفاصيل الوصول المبكر. مرحباً بك في مجتمع AAAgencies.",

    "footer.brand.description":
      "وكلاء ووكالات الذكاء الاصطناعي كخدمة. تحويل طريقة عمل المؤسسات من خلال الأتمتة الذكية.",
    "footer.brand.mission1": "كن أفضل نسخة من نفسك",
    "footer.brand.mission2": "ذاتي السيادة دائماً وفي كل الأحوال",
    "footer.platform": "المنصة",
    "footer.portals": "البوابات",
    "footer.company": "الشركة",
    "footer.links.about": "عن المنصة",
    "footer.links.services": "الخدمات",
    "footer.links.apiDocs": "وثائق API",
    "footer.links.pricing": "الأسعار",
    "footer.links.aiAgentConsole": "وحدة تحكم وكلاء الذكاء الاصطناعي",
    "footer.links.agencyDashboard": "لوحة تحكم الوكالة",
    "footer.links.adminConsole": "وحدة تحكم المسؤول",
    "footer.links.contact": "تواصل معنا",
    "footer.links.blog": "المدونة",
    "footer.links.careers": "الوظائف",
    "footer.links.press": "الصحافة",
    "footer.copyright":
      "AAAgencies SerVSys™. جميع الحقوق محفوظة. إطار FinFracFran™.",
  },

  pt: {
    "nav.login": "Entrar",
    "nav.getStarted": "Começar",
    "nav.tagline": "O Nosso Empodera o Seu",

    "hero.badge": "Agentes e Agências de IA como Serviço",
    "hero.h1_line1": "O Futuro do Trabalho é",
    "hero.h1_servsys": "Impulsionado pelo SerVSys™",
    "hero.h1_with": "com",
    "hero.h1_finfracfran": "FinFracFran™",
    "hero.subheadline":
      "Uma plataforma multi-tenant movida por IA para operações multi-agente, fracionamento financeiro e distribuição equitativa de riqueza.",
    "hero.cta1": "Explorar Portais",
    "hero.cta2": "Entrar no Painel",

    "features.multiAgentSwarms": "Enxames Multi-Agente",
    "features.aiFirst": "Arquitetura IA em Primeiro",
    "features.multiLingual": "Multilíngue & Global",
    "features.selfSovereign": "Identidade Auto-Soberana",

    "portals.heading": "Escolha Seu Portal",
    "portals.subheading":
      "Três pontos de entrada dedicados — cada um adaptado a um papel diferente no ecossistema SerVSys™.",
    "portals.enterPortal": "Entrar no Portal",
    "portals.a.eyebrow": "Portal A",
    "portals.a.title": "Console de Agentes IA",
    "portals.a.description":
      "Acesse enxames de agentes IA, roteamento de tarefas e automação inteligente para seu negócio.",
    "portals.b.eyebrow": "Portal B",
    "portals.b.title": "Painel do Cliente e Agência",
    "portals.b.description":
      "Gerencie sua organização, equipes, filiais, carteiras e adesões de fornecedores.",
    "portals.c.eyebrow": "Portal C",
    "portals.c.title": "Console do Super Admin",
    "portals.c.description":
      "Controles em nível de plataforma, provisionamento de inquilinos, logs de auditoria e supervisão multi-org.",

    "services.badge": "Serviços da Plataforma",
    "services.heading": "Tudo o que Sua Agência Precisa",
    "services.subheading":
      "Três sistemas interconectados — IA, Operações e Finanças — projetados para funcionar como um.",
    "services.agents.eyebrow": "Agentes IA",
    "services.agents.title": "Automação Inteligente Multi-Agente",
    "services.agents.description":
      "Implante enxames de agentes IA que roteiam tarefas, automatizam fluxos de trabalho e aprendem com os dados da sua organização.",
    "services.agents.bullet1": "Roteamento e orquestração multi-agente",
    "services.agents.bullet2":
      "Registro e gerenciamento do ciclo de vida de agentes",
    "services.agents.bullet3": "Automação em tempo real entre departamentos",
    "services.agents.bullet4": "Modelos IA conectáveis e lógica personalizada",
    "services.servsys.eyebrow": "SerVSys™",
    "services.servsys.title": "Serviço como Sistema",
    "services.servsys.description":
      "Uma plataforma unificada para entrega de serviços multi-org, multi-fornecedor, multi-site e multi-usuário.",
    "services.servsys.bullet1": "Gerenciamento de organizações multi-tenant",
    "services.servsys.bullet2": "Provisionamento de filiais e sites",
    "services.servsys.bullet3": "Suporte multi-fornecedor e multi-carteira",
    "services.servsys.bullet4": "Acesso por função em todas as equipes",
    "services.finfracfran.eyebrow": "FinFracFran™",
    "services.finfracfran.title": "Fracionamento Financeiro & Franquias",
    "services.finfracfran.description":
      "O framework FinFracFran™ moderniza a propriedade de ativos e distribuição de riqueza.",
    "services.finfracfran.bullet1":
      "Propriedade fracionada e tokenização de ativos",
    "services.finfracfran.bullet2":
      "Licenciamento de franquia e fluxos de royalties",
    "services.finfracfran.bullet3":
      "Modelos de distribuição equitativa de riqueza",
    "services.finfracfran.bullet4":
      "Multi-carteira e trilhos de pagamento prontos",

    "pricing.badge": "Preços",
    "pricing.heading": "Planos para Todas as Escalas",
    "pricing.subheading":
      "De exploradores individuais a empresas globais — SerVSys™ cresce com você.",
    "pricing.recommended": "Recomendado",
    "pricing.forever": "para sempre",
    "pricing.perMonth": "/ mês",
    "pricing.free.name": "Gratuito",
    "pricing.free.description": "Explore a plataforma sem compromisso.",
    "pricing.free.cta": "Começar Gratuitamente",
    "pricing.free.f1": "1 organização",
    "pricing.free.f2": "Até 3 usuários",
    "pricing.free.f3": "1 slot de agente IA",
    "pricing.free.f4": "Gerenciamento básico de tarefas",
    "pricing.free.f5": "Suporte da comunidade",
    "pricing.starter.name": "Inicial",
    "pricing.starter.description":
      "Para equipes pequenas e agências em crescimento.",
    "pricing.starter.cta": "Solicitar Acesso Antecipado",
    "pricing.starter.f1": "3 organizações",
    "pricing.starter.f2": "Até 20 usuários",
    "pricing.starter.f3": "5 slots de agentes IA",
    "pricing.starter.f4": "Integração por link de convite",
    "pricing.starter.f5": "Suporte multi-carteira",
    "pricing.starter.f6": "Suporte por e-mail",
    "pricing.professional.name": "Profissional",
    "pricing.professional.description": "Completo para agências estabelecidas.",
    "pricing.professional.cta": "Obter Profissional",
    "pricing.professional.f1": "Organizações ilimitadas",
    "pricing.professional.f2": "Usuários ilimitados",
    "pricing.professional.f3": "25 slots de agentes IA",
    "pricing.professional.f4": "Operações multi-site SerVSys™",
    "pricing.professional.f5": "Framework FinFracFran™",
    "pricing.professional.f6": "Gerenciamento de filiais e fornecedores",
    "pricing.professional.f7": "Suporte prioritário",
    "pricing.professional.f8": "Acesso API",
    "pricing.enterprise.name": "Empresarial",
    "pricing.enterprise.description":
      "Adaptado para implantações multi-tenant em larga escala.",
    "pricing.enterprise.cta": "Fale com Vendas",
    "pricing.enterprise.f1": "Tudo ilimitado",
    "pricing.enterprise.f2": "Opções de marca branca",
    "pricing.enterprise.f3": "Tenant PaaS dedicado",
    "pricing.enterprise.f4": "Cota de agentes IA personalizada",
    "pricing.enterprise.f5": "SLA e conformidade",
    "pricing.enterprise.f6": "Gerente de conta dedicado",
    "pricing.enterprise.f7": "Acesso a webhooks e logs de auditoria",

    "lead.heading": "Obtenha Acesso Antecipado",
    "lead.subheading":
      "Seja um dos primeiros a experimentar a plataforma SerVSys™. Compartilhe seu interesse e entraremos em contato.",
    "lead.form.nameLbl": "Nome",
    "lead.form.namePlaceholder": "Seu nome completo",
    "lead.form.nameRequired": "Nome é obrigatório",
    "lead.form.emailLbl": "E-mail",
    "lead.form.emailPlaceholder": "voce@exemplo.com",
    "lead.form.emailRequired": "E-mail é obrigatório",
    "lead.form.emailInvalid": "Por favor insira um endereço de e-mail válido",
    "lead.form.orgLbl": "Organização",
    "lead.form.orgOptional": "(opcional)",
    "lead.form.orgPlaceholder": "Nome da sua empresa ou organização",
    "lead.form.roleLbl": "Função / Interesse",
    "lead.form.rolePlaceholder": "Selecione sua função",
    "lead.form.roleRequired": "Por favor selecione sua função ou interesse",
    "lead.form.role.individual": "Individual",
    "lead.form.role.agency": "Agência",
    "lead.form.role.enterprise": "Empresa",
    "lead.form.role.developer": "Desenvolvedor",
    "lead.form.role.partner": "Parceiro",
    "lead.form.interestLbl": "Mensagem / Interesse",
    "lead.form.interestPlaceholder":
      "Diga-nos o que você quer construir ou explorar...",
    "lead.form.interestRequired": "Por favor compartilhe uma mensagem breve",
    "lead.form.submit": "Solicitar Acesso Antecipado",
    "lead.form.submitting": "Enviando...",
    "lead.success.heading": "Você está na lista!",
    "lead.success.body":
      "Entraremos em contato em breve com detalhes de acesso antecipado. Bem-vindo à comunidade AAAgencies.",

    "footer.brand.description":
      "Agentes e Agências de IA como Serviço. Transformando como as organizações operam através da automação inteligente.",
    "footer.brand.mission1": "Seja o Melhor de Si Mesmo",
    "footer.brand.mission2": "Soberano Sempre e em Tudo",
    "footer.platform": "Plataforma",
    "footer.portals": "Portais",
    "footer.company": "Empresa",
    "footer.links.about": "Sobre",
    "footer.links.services": "Serviços",
    "footer.links.apiDocs": "Docs API",
    "footer.links.pricing": "Preços",
    "footer.links.aiAgentConsole": "Console de Agentes IA",
    "footer.links.agencyDashboard": "Painel da Agência",
    "footer.links.adminConsole": "Console Admin",
    "footer.links.contact": "Contato",
    "footer.links.blog": "Blog",
    "footer.links.careers": "Carreiras",
    "footer.links.press": "Imprensa",
    "footer.copyright":
      "AAAgencies SerVSys™. Todos os direitos reservados. Framework FinFracFran™.",
  },

  sw: {
    "nav.login": "Ingia",
    "nav.getStarted": "Anza",
    "nav.tagline": "Yetu Inakuwezesha Yako",

    "hero.badge": "Mawakala na Mashirika ya AI kama Huduma",
    "hero.h1_line1": "Mustakabali wa Kazi ni",
    "hero.h1_servsys": "Inayoendeshwa na SerVSys™",
    "hero.h1_with": "pamoja na",
    "hero.h1_finfracfran": "FinFracFran™",
    "hero.subheadline":
      "Jukwaa la multi-tenant linaloendeshwa na AI kwa shughuli za mawakala wengi, ugawaji wa fedha, na usambazaji sawa wa utajiri.",
    "hero.cta1": "Chunguza Milango",
    "hero.cta2": "Ingia kwenye Dashibodi",

    "features.multiAgentSwarms": "Makundi ya Mawakala Wengi",
    "features.aiFirst": "Usanifu wa AI Kwanza",
    "features.multiLingual": "Lugha Nyingi & Kimataifa",
    "features.selfSovereign": "Utambulisho wa Kujitegemea",

    "portals.heading": "Chagua Mlango Wako",
    "portals.subheading":
      "Vituo vitatu vya kuingia — kila kimoja kimepangwa kwa jukumu tofauti katika mfumo wa SerVSys™.",
    "portals.enterPortal": "Ingia Mlangoni",
    "portals.a.eyebrow": "Mlango A",
    "portals.a.title": "Konsoli ya Mawakala wa AI",
    "portals.a.description":
      "Fikia makundi ya mawakala wa AI, uelekezi wa kazi, na uotomatishaji wa akili kwa biashara yako.",
    "portals.b.eyebrow": "Mlango B",
    "portals.b.title": "Dashibodi ya Mteja & Wakala",
    "portals.b.description":
      "Simamia shirika lako, timu, matawi, pochi, na uanachama wa wasambazaji.",
    "portals.c.eyebrow": "Mlango C",
    "portals.c.title": "Konsoli ya Msimamizi Mkuu",
    "portals.c.description":
      "Udhibiti wa kiwango cha jukwaa, utoaji wa wakala, kumbukumbu za ukaguzi, na usimamizi wa mashirika mengi.",

    "services.badge": "Huduma za Jukwaa",
    "services.heading": "Kila Kitu Wakala Wako Anahitaji",
    "services.subheading":
      "Mifumo mitatu iliyounganishwa — AI, Shughuli, na Fedha — iliyoundwa kufanya kazi kama moja.",
    "services.agents.eyebrow": "Mawakala wa AI",
    "services.agents.title": "Uotomatishaji wa Akili wa Mawakala Wengi",
    "services.agents.description":
      "Peleka makundi ya mawakala wa AI yanayoelekeza kazi na kuendesha mtiririko wa kazi.",
    "services.agents.bullet1": "Uelekezi na uratibu wa mawakala wengi",
    "services.agents.bullet2":
      "Usajili na usimamizi wa mzunguko wa maisha wa mawakala",
    "services.agents.bullet3": "Uotomatishaji wa wakati halisi kati ya idara",
    "services.agents.bullet4":
      "Mifano ya AI inayoweza kuunganishwa na mantiki maalum",
    "services.servsys.eyebrow": "SerVSys™",
    "services.servsys.title": "Huduma kama Mfumo",
    "services.servsys.description":
      "Jukwaa lililounganishwa kwa utoaji wa huduma za mashirika mengi, wasambazaji wengi, maeneo mengi.",
    "services.servsys.bullet1": "Usimamizi wa mashirika ya multi-tenant",
    "services.servsys.bullet2": "Utoaji wa matawi na maeneo",
    "services.servsys.bullet3": "Msaada wa wasambazaji wengi na pochi nyingi",
    "services.servsys.bullet4": "Ufikiaji uliowekwa kulingana na jukumu",
    "services.finfracfran.eyebrow": "FinFracFran™",
    "services.finfracfran.title": "Ugawaji wa Fedha & Ufisaji wa Biashara",
    "services.finfracfran.description":
      "Mfumo wa FinFracFran™ unaboresha umiliki wa mali na usambazaji wa utajiri.",
    "services.finfracfran.bullet1": "Umiliki wa sehemu wa mali na tokenization",
    "services.finfracfran.bullet2": "Leseni za ufisaji na mtiririko wa mrabaha",
    "services.finfracfran.bullet3": "Mifano ya usambazaji sawa wa utajiri",
    "services.finfracfran.bullet4":
      "Pochi nyingi na reli za malipo ziko tayari",

    "pricing.badge": "Bei",
    "pricing.heading": "Mipango kwa Kila Ukubwa",
    "pricing.subheading":
      "Kutoka kwa wachunguzi binafsi hadi makampuni ya kimataifa — SerVSys™ inakua nawe.",
    "pricing.recommended": "Inapendekezwa",
    "pricing.forever": "milele",
    "pricing.perMonth": "/ mwezi",
    "pricing.free.name": "Bure",
    "pricing.free.description": "Chunguza jukwaa bila ahadi.",
    "pricing.free.cta": "Anza Bure",
    "pricing.free.f1": "Shirika 1",
    "pricing.free.f2": "Hadi watumiaji 3",
    "pricing.free.f3": "Nafasi 1 ya wakala wa AI",
    "pricing.free.f4": "Usimamizi wa msingi wa kazi",
    "pricing.free.f5": "Msaada wa jamii",
    "pricing.starter.name": "Mwanzo",
    "pricing.starter.description": "Kwa timu ndogo na wakala wanaokua.",
    "pricing.starter.cta": "Omba Ufikiaji wa Mapema",
    "pricing.starter.f1": "Mashirika 3",
    "pricing.starter.f2": "Hadi watumiaji 20",
    "pricing.starter.f3": "Nafasi 5 za mawakala wa AI",
    "pricing.starter.f4": "Uandikishaji wa kiungo cha mwaliko",
    "pricing.starter.f5": "Msaada wa pochi nyingi",
    "pricing.starter.f6": "Msaada wa barua pepe",
    "pricing.professional.name": "Kitaalamu",
    "pricing.professional.description": "Kamili kwa wakala walioimarika.",
    "pricing.professional.cta": "Pata Kitaalamu",
    "pricing.professional.f1": "Mashirika yasiyopungukiwa",
    "pricing.professional.f2": "Watumiaji wasiopungukiwa",
    "pricing.professional.f3": "Nafasi 25 za mawakala wa AI",
    "pricing.professional.f4": "Shughuli za maeneo mengi za SerVSys™",
    "pricing.professional.f5": "Mfumo wa FinFracFran™",
    "pricing.professional.f6": "Usimamizi wa matawi na wasambazaji",
    "pricing.professional.f7": "Msaada wa kipaumbele",
    "pricing.professional.f8": "Ufikiaji wa API",
    "pricing.enterprise.name": "Biashara Kubwa",
    "pricing.enterprise.description":
      "Iliyoundwa kwa usambazaji wa multi-tenant kwa kiwango kikubwa.",
    "pricing.enterprise.cta": "Wasiliana na Mauzo",
    "pricing.enterprise.f1": "Kila kitu bila kikomo",
    "pricing.enterprise.f2": "Chaguo za nembo nyeupe",
    "pricing.enterprise.f3": "Wakala wa PaaS maalum",
    "pricing.enterprise.f4": "Mgao wa mawakala wa AI maalum",
    "pricing.enterprise.f5": "SLA na uzingatifu",
    "pricing.enterprise.f6": "Meneja wa akaunti maalum",
    "pricing.enterprise.f7": "Ufikiaji wa Webhook na kumbukumbu za ukaguzi",

    "lead.heading": "Pata Ufikiaji wa Mapema",
    "lead.subheading":
      "Kuwa miongoni mwa wa kwanza kupitia jukwaa la SerVSys™. Shiriki maslahi yako na tutawasiliana nawe.",
    "lead.form.nameLbl": "Jina",
    "lead.form.namePlaceholder": "Jina lako kamili",
    "lead.form.nameRequired": "Jina linahitajika",
    "lead.form.emailLbl": "Barua pepe",
    "lead.form.emailPlaceholder": "wewe@mfano.com",
    "lead.form.emailRequired": "Barua pepe inahitajika",
    "lead.form.emailInvalid": "Tafadhali ingiza anwani ya barua pepe sahihi",
    "lead.form.orgLbl": "Shirika",
    "lead.form.orgOptional": "(hiari)",
    "lead.form.orgPlaceholder": "Jina la kampuni au shirika lako",
    "lead.form.roleLbl": "Jukumu / Maslahi",
    "lead.form.rolePlaceholder": "Chagua jukumu lako",
    "lead.form.roleRequired": "Tafadhali chagua jukumu au maslahi yako",
    "lead.form.role.individual": "Binafsi",
    "lead.form.role.agency": "Wakala",
    "lead.form.role.enterprise": "Biashara",
    "lead.form.role.developer": "Msanidi",
    "lead.form.role.partner": "Mshirika",
    "lead.form.interestLbl": "Ujumbe / Maslahi",
    "lead.form.interestPlaceholder":
      "Tuambie unachotaka kujenga au kuchunguza...",
    "lead.form.interestRequired": "Tafadhali shiriki ujumbe mfupi",
    "lead.form.submit": "Omba Ufikiaji wa Mapema",
    "lead.form.submitting": "Inatuma...",
    "lead.success.heading": "Uko kwenye orodha!",
    "lead.success.body":
      "Tutawasiliana nawe hivi karibuni na maelezo ya ufikiaji wa mapema. Karibu katika jamii ya AAAgencies.",

    "footer.brand.description":
      "Mawakala na Mashirika ya AI kama Huduma. Kubadilisha jinsi mashirika yanavyofanya kazi kupitia uotomatishaji wa akili.",
    "footer.brand.mission1": "Kuwa Bora Zaidi Kwako",
    "footer.brand.mission2": "Huru Daima na Katika Kila Hali",
    "footer.platform": "Jukwaa",
    "footer.portals": "Milango",
    "footer.company": "Kampuni",
    "footer.links.about": "Kuhusu",
    "footer.links.services": "Huduma",
    "footer.links.apiDocs": "Nyaraka za API",
    "footer.links.pricing": "Bei",
    "footer.links.aiAgentConsole": "Konsoli ya Mawakala wa AI",
    "footer.links.agencyDashboard": "Dashibodi ya Wakala",
    "footer.links.adminConsole": "Konsoli ya Msimamizi",
    "footer.links.contact": "Wasiliana",
    "footer.links.blog": "Blogu",
    "footer.links.careers": "Kazi",
    "footer.links.press": "Habari",
    "footer.copyright":
      "AAAgencies SerVSys™. Haki zote zimehifadhiwa. Mfumo wa FinFracFran™.",
  },
};

// ─────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────

const I18nContext = createContext<I18nContextValue>({
  lang: "en",
  setLang: () => {},
  t: (key: string) => key,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(() => {
    const stored = localStorage.getItem(
      "preferred_language",
    ) as LangCode | null;
    return stored && stored in translations ? stored : "en";
  });

  const setLang = (newLang: string) => {
    const l = (newLang in translations ? newLang : "en") as LangCode;
    setLangState(l);
    localStorage.setItem("preferred_language", l);
  };

  const t = (key: string): string => {
    return translations[lang]?.[key] ?? translations.en?.[key] ?? key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}

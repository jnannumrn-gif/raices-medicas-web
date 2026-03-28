/**
 * Raíces Médicas — Internationalization (i18n)
 * Supports: Español (es), English (en), Português (pt)
 */

const translations = {
  es: {
    // Nav
    "nav.inicio": "Inicio",
    "nav.nosotros": "Nosotros",
    "nav.programas": "Programas",
    "nav.valores": "Valores",
    "nav.raices": "Nuestras Ra\u00edces",
    "nav.episodio": "\u00daltimo Episodio",
    "nav.quiz": "Quiz",
    "nav.actualidades": "Actualidades",
    "nav.contacto": "Contacto",
    "nav.cta": "Contactar",

    // Hero
    "hero.badge": "Educaci\u00f3n M\u00e9dica de Excelencia",
    "hero.title.1": "Donde la ",
    "hero.title.accent1": "ciencia",
    "hero.title.2": " se encuentra con la ",
    "hero.title.accent2": "compasi\u00f3n",
    "hero.desc": "Ra\u00edces M\u00e9dicas es una plataforma educativa dedicada a la formaci\u00f3n en salud renal, nefrolog\u00eda y salud digital. Transformamos el conocimiento m\u00e9dico en herramientas accesibles para profesionales y comunidades.",
    "hero.btn.programs": "Explorar programas",
    "hero.btn.about": "Conocer m\u00e1s",
    "hero.stat.1.number": "850M+",
    "hero.stat.1.label": "Personas con enfermedad renal",
    "hero.stat.2.number": "10%",
    "hero.stat.2.label": "Poblaci\u00f3n mundial afectada",
        "hero.stat.3.number": "5ª",
        "hero.stat.3.label": "Causa de muerte para 2040",

    // Nuestras Raíces
    "raices.label": "Nuestras Ra\u00edces",
    "raices.title": "\uD83C\uDF31 Nuestras Ra\u00edces",
    "raices.subtitle": "Pablo Nannum, RN, BSN \u2014 Fundador",
    "raices.p1": "Hace m\u00e1s de 30 a\u00f1os, Pablo lleg\u00f3 a los Estados Unidos y comenz\u00f3 su camino en la salud haciendo lo que hab\u00eda disponible: limpieza y mantenimiento en un hospital en Hoboken, Nueva Jersey. Pero desde el primer d\u00eda tuvo una meta clara \u2014 crecer dentro de ese mundo.",
    "raices.p2": "Lo que sigui\u00f3 fue un ascenso construido paso a paso: t\u00e9cnico en hemodi\u00e1lisis, LPN, RN, BSN, y hoy en camino a convertirse en Nurse Practitioner. A\u00f1os al lado de pacientes renales le ense\u00f1aron una verdad inc\u00f3moda: muchas de esas enfermedades pudieron haberse prevenido, si alguien les hubiera dado la informaci\u00f3n correcta, en su idioma, a tiempo.",
    "raices.p3": "Ra\u00edces M\u00e9dicas naci\u00f3 de esa convicci\u00f3n \u2014 que el conocimiento transforma trayectorias y salva vidas. Es una plataforma de educaci\u00f3n renal en espa\u00f1ol, con contenido claro, basado en evidencia cient\u00edfica y centrado en el paciente. Dirigida tanto a la comunidad general como a profesionales de la salud hispanohablantes en todo el mundo.",
    "raices.quote": "\u201CConocimiento que salva vidas.\u201D",

    // Último Episodio
    "episodio.eyebrow": "Canal de YouTube",
    "episodio.title": "\u00daltimo Episodio",
    "episodio.subtitle": "Educaci\u00f3n en salud renal \u2014 directo a tu pantalla, en tu idioma.",
    "episodio.loading": "Cargando video\u2026",
    "episodio.error": "No se pudo cargar el video. ",
    "episodio.error.link": "Ver canal en YouTube \u2192",
    "episodio.watch": "Ver en YouTube \u2197",
    "episodio.channel": "Ver todos los videos en el canal \u2192",

    // Síguenos en Nuestras Redes
    "redes.title": "S\u00edguenos en Nuestras Redes",
    "redes.desc": "Contenido educativo sobre salud renal, prevenci\u00f3n y bienestar en espa\u00f1ol. Suscr\u00edbete para no perderte nuestros videos y actualizaciones.",
    "redes.btn.yt": "Suscr\u00edbete",
    "redes.btn.wa": "WhatsApp",
    "redes.btn.tg": "Telegram",
    "redes.qr.wa": "Escanea para seguirnos en WhatsApp",
    "redes.qr.yt": "Escanea para visitar nuestro canal",

    // Sobre Nosotros
    "about.label": "Sobre Nosotros",
    "about.title": "Formando el futuro de la salud renal",
    "about.desc": "Ra\u00edces M\u00e9dicas nace con la misi\u00f3n de democratizar la educaci\u00f3n en salud renal y nefrolog\u00eda. Creemos que el acceso a informaci\u00f3n m\u00e9dica clara y basada en evidencia es un derecho fundamental. Nuestra plataforma conecta a profesionales de la salud, estudiantes y pacientes con recursos educativos de calidad.",
    "about.feat1.title": "Educaci\u00f3n Continua",
    "about.feat1.desc": "Cursos y talleres para profesionales de la salud",
    "about.feat2.title": "Investigaci\u00f3n",
    "about.feat2.desc": "Contenido basado en evidencia cient\u00edfica",
    "about.feat3.title": "Salud Digital",
    "about.feat3.desc": "Herramientas tecnol\u00f3gicas para la salud",
    "about.feat4.title": "Comunidad",
    "about.feat4.desc": "Red de profesionales y pacientes",

    // Programas
    "programs.label": "Nuestros Programas",
    "programs.title": "\u00c1reas de enfoque educativo",
    "programs.desc": "Ofrecemos programas especializados en las \u00e1reas m\u00e1s cr\u00edticas de la salud renal y la educaci\u00f3n m\u00e9dica contempor\u00e1nea.",
    "programs.card1.tag": "Nefrolog\u00eda",
    "programs.card1.title": "Salud Renal y Prevenci\u00f3n",
    "programs.card1.desc": "Educaci\u00f3n integral sobre funci\u00f3n renal, creatinina, filtraci\u00f3n glomerular, prevenci\u00f3n de enfermedad renal cr\u00f3nica y manejo temprano.",
    "programs.card1.link": "M\u00e1s informaci\u00f3n",
    "programs.card2.tag": "Innovaci\u00f3n",
    "programs.card2.title": "Salud Digital y Tecnolog\u00eda",
    "programs.card2.desc": "Exploramos c\u00f3mo la tecnolog\u00eda transforma la atenci\u00f3n m\u00e9dica: telemedicina, inteligencia artificial en diagn\u00f3stico, y herramientas digitales para pacientes.",
    "programs.card2.link": "M\u00e1s informaci\u00f3n",
    "programs.card3.tag": "Formaci\u00f3n",
    "programs.card3.title": "Educaci\u00f3n M\u00e9dica Continua",
    "programs.card3.desc": "Programas de formaci\u00f3n continua para m\u00e9dicos, enfermeros y profesionales de la salud. Talleres, seminarios y recursos actualizados.",
    "programs.card3.link": "M\u00e1s informaci\u00f3n",

    // Valores
    "values.label": "Nuestros Valores",
    "values.title": "Lo que nos define",
    "values.desc": "Cada decisi\u00f3n que tomamos est\u00e1 guiada por estos principios fundamentales.",
    "values.v1.title": "Educaci\u00f3n Accesible",
    "values.v1.desc": "Creemos que el conocimiento m\u00e9dico debe estar al alcance de todos, sin barreras.",
    "values.v2.title": "Compasi\u00f3n",
    "values.v2.desc": "Cada paciente merece ser tratado con dignidad, empat\u00eda y respeto.",
    "values.v3.title": "Innovaci\u00f3n",
    "values.v3.desc": "Abrazamos la tecnolog\u00eda como herramienta para mejorar la atenci\u00f3n en salud.",
    "values.v4.title": "Crecimiento",
    "values.v4.desc": "Nos comprometemos con el aprendizaje continuo y la mejora constante.",

    // CTA Banner
    "cta.title": "\u00danete a nuestra comunidad educativa",
    "cta.desc": "S\u00e9 parte de una red de profesionales comprometidos con la salud renal y la educaci\u00f3n m\u00e9dica de calidad.",
    "cta.btn": "Cont\u00e1ctanos hoy",

    // Contacto
    "contact.label": "Contacto",
    "contact.title": "Hablemos sobre educaci\u00f3n m\u00e9dica",
    "contact.desc": "Estamos aqu\u00ed para responder tus preguntas sobre nuestros programas educativos, colaboraciones y oportunidades.",
    "contact.email.title": "Correo electr\u00f3nico",
    "contact.web.title": "Sitio web",
    "contact.location.title": "Ubicaci\u00f3n",
    "contact.location.desc": "Educaci\u00f3n m\u00e9dica sin fronteras",
    "contact.form.name": "Nombre",
    "contact.form.name.ph": "Tu nombre",
    "contact.form.email": "Correo",
    "contact.form.email.ph": "tu@correo.com",
    "contact.form.subject": "Asunto",
    "contact.form.subject.ph": "\u00bfSobre qu\u00e9 quieres hablar?",
    "contact.form.message": "Mensaje",
    "contact.form.message.ph": "Escribe tu mensaje aqu\u00ed...",
    "contact.form.submit": "Enviar mensaje",

    // Footer
    "footer.desc": "Plataforma de educaci\u00f3n m\u00e9dica dedicada a la salud renal, nefrolog\u00eda e innovaci\u00f3n en salud digital.",
    "footer.nav.title": "Navegaci\u00f3n",
    "footer.nav.inicio": "Inicio",
    "footer.nav.nosotros": "Nosotros",
    "footer.nav.programas": "Programas",
    "footer.nav.valores": "Valores",
    "footer.programs.title": "Programas",
    "footer.programs.renal": "Salud Renal",
    "footer.programs.digital": "Salud Digital",
    "footer.programs.edu": "Educaci\u00f3n M\u00e9dica",
    "footer.programs.research": "Investigaci\u00f3n",
    "footer.contact.title": "Contacto",
    "footer.contact.email": "Email",
    "footer.contact.web": "Sitio web",
    "footer.copy": "\u00a9 2026 Ra\u00edces M\u00e9dicas. Todos los derechos reservados.",

    // Visitor Counter
    "counter.label": "Gracias por ser el visitante n\u00famero",

    // Meta
    "meta.title": "Ra\u00edces M\u00e9dicas | Educaci\u00f3n M\u00e9dica y Salud Renal",
    "meta.description": "Ra\u00edces M\u00e9dicas: plataforma de educaci\u00f3n m\u00e9dica, salud renal e innovaci\u00f3n en salud digital."
  },

  en: {
    // Nav
    "nav.inicio": "Home",
    "nav.nosotros": "About Us",
    "nav.programas": "Programs",
    "nav.valores": "Values",
    "nav.raices": "Our Roots",
    "nav.episodio": "Latest Episode",
    "nav.quiz": "Quiz",
    "nav.actualidades": "News",
    "nav.contacto": "Contact",
    "nav.cta": "Contact Us",

    // Hero
    "hero.badge": "Medical Education Excellence",
    "hero.title.1": "Where ",
    "hero.title.accent1": "science",
    "hero.title.2": " meets ",
    "hero.title.accent2": "compassion",
    "hero.desc": "Ra\u00edces M\u00e9dicas is an educational platform dedicated to renal health, nephrology, and digital health training. We transform medical knowledge into accessible tools for professionals and communities.",
    "hero.btn.programs": "Explore programs",
    "hero.btn.about": "Learn more",
    "hero.stat.1.number": "850M+",
    "hero.stat.1.label": "People with kidney disease",
    "hero.stat.2.number": "10%",
    "hero.stat.2.label": "World population affected",
        "hero.stat.3.number": "5th",
        "hero.stat.3.label": "Cause of death by 2040",

    // Our Roots
    "raices.label": "Our Roots",
    "raices.title": "\uD83C\uDF31 Our Roots",
    "raices.subtitle": "Pablo Nannum, RN, BSN \u2014 Founder",
    "raices.p1": "Over 30 years ago, Pablo arrived in the United States and began his journey in healthcare doing whatever was available: cleaning and maintenance at a hospital in Hoboken, New Jersey. But from day one, he had a clear goal \u2014 to grow within that world.",
    "raices.p2": "What followed was a career built step by step: hemodialysis technician, LPN, RN, BSN, and today on his way to becoming a Nurse Practitioner. Years alongside kidney patients taught him an uncomfortable truth: many of those diseases could have been prevented, if someone had given them the right information, in their language, in time.",
    "raices.p3": "Ra\u00edces M\u00e9dicas was born from that conviction \u2014 that knowledge transforms trajectories and saves lives. It is a renal education platform in Spanish, with clear, evidence-based, patient-centered content. Aimed at both the general community and Spanish-speaking healthcare professionals worldwide.",
    "raices.quote": "\u201CKnowledge that saves lives.\u201D",

    // Latest Episode
    "episodio.eyebrow": "YouTube Channel",
    "episodio.title": "Latest Episode",
    "episodio.subtitle": "Renal health education \u2014 straight to your screen, in your language.",
    "episodio.loading": "Loading video\u2026",
    "episodio.error": "Could not load the video. ",
    "episodio.error.link": "View channel on YouTube \u2192",
    "episodio.watch": "Watch on YouTube \u2197",
    "episodio.channel": "See all videos on the channel \u2192",

    // Follow Us
    "redes.title": "Follow Us on Social Media",
    "redes.desc": "Educational content about renal health, prevention, and wellness in Spanish. Subscribe so you don\u2019t miss our videos and updates.",
    "redes.btn.yt": "Subscribe",
    "redes.btn.wa": "WhatsApp",
    "redes.btn.tg": "Telegram",
    "redes.qr.wa": "Scan to follow us on WhatsApp",
    "redes.qr.yt": "Scan to visit our channel",

    // About Us
    "about.label": "About Us",
    "about.title": "Shaping the future of renal health",
    "about.desc": "Ra\u00edces M\u00e9dicas was founded with the mission of democratizing renal health and nephrology education. We believe that access to clear, evidence-based medical information is a fundamental right. Our platform connects healthcare professionals, students, and patients with quality educational resources.",
    "about.feat1.title": "Continuing Education",
    "about.feat1.desc": "Courses and workshops for healthcare professionals",
    "about.feat2.title": "Research",
    "about.feat2.desc": "Evidence-based scientific content",
    "about.feat3.title": "Digital Health",
    "about.feat3.desc": "Technological tools for healthcare",
    "about.feat4.title": "Community",
    "about.feat4.desc": "Network of professionals and patients",

    // Programs
    "programs.label": "Our Programs",
    "programs.title": "Areas of educational focus",
    "programs.desc": "We offer specialized programs in the most critical areas of renal health and contemporary medical education.",
    "programs.card1.tag": "Nephrology",
    "programs.card1.title": "Renal Health & Prevention",
    "programs.card1.desc": "Comprehensive education on kidney function, creatinine, glomerular filtration, chronic kidney disease prevention, and early management.",
    "programs.card1.link": "Learn more",
    "programs.card2.tag": "Innovation",
    "programs.card2.title": "Digital Health & Technology",
    "programs.card2.desc": "We explore how technology transforms healthcare: telemedicine, artificial intelligence in diagnostics, and digital tools for patients.",
    "programs.card2.link": "Learn more",
    "programs.card3.tag": "Training",
    "programs.card3.title": "Continuing Medical Education",
    "programs.card3.desc": "Continuing education programs for physicians, nurses, and healthcare professionals. Workshops, seminars, and up-to-date resources.",
    "programs.card3.link": "Learn more",

    // Values
    "values.label": "Our Values",
    "values.title": "What defines us",
    "values.desc": "Every decision we make is guided by these fundamental principles.",
    "values.v1.title": "Accessible Education",
    "values.v1.desc": "We believe medical knowledge should be within everyone\u2019s reach, without barriers.",
    "values.v2.title": "Compassion",
    "values.v2.desc": "Every patient deserves to be treated with dignity, empathy, and respect.",
    "values.v3.title": "Innovation",
    "values.v3.desc": "We embrace technology as a tool to improve healthcare.",
    "values.v4.title": "Growth",
    "values.v4.desc": "We are committed to continuous learning and constant improvement.",

    // CTA Banner
    "cta.title": "Join our educational community",
    "cta.desc": "Be part of a network of professionals committed to renal health and quality medical education.",
    "cta.btn": "Contact us today",

    // Contact
    "contact.label": "Contact",
    "contact.title": "Let\u2019s talk about medical education",
    "contact.desc": "We are here to answer your questions about our educational programs, collaborations, and opportunities.",
    "contact.email.title": "Email",
    "contact.web.title": "Website",
    "contact.location.title": "Location",
    "contact.location.desc": "Medical education without borders",
    "contact.form.name": "Name",
    "contact.form.name.ph": "Your name",
    "contact.form.email": "Email",
    "contact.form.email.ph": "you@email.com",
    "contact.form.subject": "Subject",
    "contact.form.subject.ph": "What would you like to talk about?",
    "contact.form.message": "Message",
    "contact.form.message.ph": "Write your message here...",
    "contact.form.submit": "Send message",

    // Footer
    "footer.desc": "Medical education platform dedicated to renal health, nephrology, and digital health innovation.",
    "footer.nav.title": "Navigation",
    "footer.nav.inicio": "Home",
    "footer.nav.nosotros": "About Us",
    "footer.nav.programas": "Programs",
    "footer.nav.valores": "Values",
    "footer.programs.title": "Programs",
    "footer.programs.renal": "Renal Health",
    "footer.programs.digital": "Digital Health",
    "footer.programs.edu": "Medical Education",
    "footer.programs.research": "Research",
    "footer.contact.title": "Contact",
    "footer.contact.email": "Email",
    "footer.contact.web": "Website",
    "footer.copy": "\u00a9 2026 Ra\u00edces M\u00e9dicas. All rights reserved.",

    // Visitor Counter
    "counter.label": "Thanks for being visitor number",

    // Meta
    "meta.title": "Ra\u00edces M\u00e9dicas | Medical Education & Renal Health",
    "meta.description": "Ra\u00edces M\u00e9dicas: medical education platform, renal health, and digital health innovation."
  },

  pt: {
    // Nav
    "nav.inicio": "In\u00edcio",
    "nav.nosotros": "Sobre N\u00f3s",
    "nav.programas": "Programas",
    "nav.valores": "Valores",
    "nav.raices": "Nossas Ra\u00edzes",
    "nav.episodio": "\u00daltimo Epis\u00f3dio",
    "nav.quiz": "Quiz",
    "nav.actualidades": "Atualidades",
    "nav.contacto": "Contato",
    "nav.cta": "Fale Conosco",

    // Hero
    "hero.badge": "Educa\u00e7\u00e3o M\u00e9dica de Excel\u00eancia",
    "hero.title.1": "Onde a ",
    "hero.title.accent1": "ci\u00eancia",
    "hero.title.2": " encontra a ",
    "hero.title.accent2": "compaix\u00e3o",
    "hero.desc": "Ra\u00edces M\u00e9dicas \u00e9 uma plataforma educacional dedicada \u00e0 forma\u00e7\u00e3o em sa\u00fade renal, nefrologia e sa\u00fade digital. Transformamos o conhecimento m\u00e9dico em ferramentas acess\u00edveis para profissionais e comunidades.",
    "hero.btn.programs": "Explorar programas",
    "hero.btn.about": "Saiba mais",
    "hero.stat.1.number": "850M+",
    "hero.stat.1.label": "Pessoas com doen\u00e7a renal",
    "hero.stat.2.number": "10%",
    "hero.stat.2.label": "Popula\u00e7\u00e3o mundial afetada",
        "hero.stat.3.number": "5ª",
        "hero.stat.3.label": "Causa de morte até 2040",

    // Nossas Raízes
    "raices.label": "Nossas Ra\u00edzes",
    "raices.title": "\uD83C\uDF31 Nossas Ra\u00edzes",
    "raices.subtitle": "Pablo Nannum, RN, BSN \u2014 Fundador",
    "raices.p1": "H\u00e1 mais de 30 anos, Pablo chegou aos Estados Unidos e come\u00e7ou sua jornada na sa\u00fade fazendo o que estava dispon\u00edvel: limpeza e manuten\u00e7\u00e3o em um hospital em Hoboken, Nova Jersey. Mas desde o primeiro dia, ele tinha um objetivo claro \u2014 crescer dentro desse mundo.",
    "raices.p2": "O que se seguiu foi uma ascens\u00e3o constru\u00edda passo a passo: t\u00e9cnico em hemodi\u00e1lise, LPN, RN, BSN, e hoje a caminho de se tornar Nurse Practitioner. Anos ao lado de pacientes renais lhe ensinaram uma verdade desconfort\u00e1vel: muitas dessas doen\u00e7as poderiam ter sido prevenidas, se algu\u00e9m lhes tivesse dado a informa\u00e7\u00e3o correta, em seu idioma, a tempo.",
    "raices.p3": "Ra\u00edces M\u00e9dicas nasceu dessa convic\u00e7\u00e3o \u2014 de que o conhecimento transforma trajet\u00f3rias e salva vidas. \u00c9 uma plataforma de educa\u00e7\u00e3o renal em espanhol, com conte\u00fado claro, baseado em evid\u00eancia cient\u00edfica e centrado no paciente. Dirigida tanto \u00e0 comunidade em geral quanto a profissionais de sa\u00fade hispanof\u00f3nicos em todo o mundo.",
    "raices.quote": "\u201CConhecimento que salva vidas.\u201D",

    // Último Episódio
    "episodio.eyebrow": "Canal do YouTube",
    "episodio.title": "\u00daltimo Epis\u00f3dio",
    "episodio.subtitle": "Educa\u00e7\u00e3o em sa\u00fade renal \u2014 direto na sua tela, no seu idioma.",
    "episodio.loading": "Carregando v\u00eddeo\u2026",
    "episodio.error": "N\u00e3o foi poss\u00edvel carregar o v\u00eddeo. ",
    "episodio.error.link": "Ver canal no YouTube \u2192",
    "episodio.watch": "Assistir no YouTube \u2197",
    "episodio.channel": "Ver todos os v\u00eddeos no canal \u2192",

    // Siga-nos
    "redes.title": "Siga-nos nas Redes Sociais",
    "redes.desc": "Conte\u00fado educativo sobre sa\u00fade renal, preven\u00e7\u00e3o e bem-estar em espanhol. Inscreva-se para n\u00e3o perder nossos v\u00eddeos e atualiza\u00e7\u00f5es.",
    "redes.btn.yt": "Inscreva-se",
    "redes.btn.wa": "WhatsApp",
    "redes.btn.tg": "Telegram",
    "redes.qr.wa": "Escaneie para nos seguir no WhatsApp",
    "redes.qr.yt": "Escaneie para visitar nosso canal",

    // Sobre Nós
    "about.label": "Sobre N\u00f3s",
    "about.title": "Formando o futuro da sa\u00fade renal",
    "about.desc": "Ra\u00edces M\u00e9dicas nasceu com a miss\u00e3o de democratizar a educa\u00e7\u00e3o em sa\u00fade renal e nefrologia. Acreditamos que o acesso a informa\u00e7\u00e3o m\u00e9dica clara e baseada em evid\u00eancia \u00e9 um direito fundamental. Nossa plataforma conecta profissionais de sa\u00fade, estudantes e pacientes com recursos educacionais de qualidade.",
    "about.feat1.title": "Educa\u00e7\u00e3o Continuada",
    "about.feat1.desc": "Cursos e oficinas para profissionais de sa\u00fade",
    "about.feat2.title": "Pesquisa",
    "about.feat2.desc": "Conte\u00fado baseado em evid\u00eancia cient\u00edfica",
    "about.feat3.title": "Sa\u00fade Digital",
    "about.feat3.desc": "Ferramentas tecnol\u00f3gicas para a sa\u00fade",
    "about.feat4.title": "Comunidade",
    "about.feat4.desc": "Rede de profissionais e pacientes",

    // Programas
    "programs.label": "Nossos Programas",
    "programs.title": "\u00c1reas de foco educacional",
    "programs.desc": "Oferecemos programas especializados nas \u00e1reas mais cr\u00edticas da sa\u00fade renal e da educa\u00e7\u00e3o m\u00e9dica contempor\u00e2nea.",
    "programs.card1.tag": "Nefrologia",
    "programs.card1.title": "Sa\u00fade Renal e Preven\u00e7\u00e3o",
    "programs.card1.desc": "Educa\u00e7\u00e3o integral sobre fun\u00e7\u00e3o renal, creatinina, filtra\u00e7\u00e3o glomerular, preven\u00e7\u00e3o de doen\u00e7a renal cr\u00f4nica e manejo precoce.",
    "programs.card1.link": "Mais informa\u00e7\u00f5es",
    "programs.card2.tag": "Inova\u00e7\u00e3o",
    "programs.card2.title": "Sa\u00fade Digital e Tecnologia",
    "programs.card2.desc": "Exploramos como a tecnologia transforma o atendimento m\u00e9dico: telemedicina, intelig\u00eancia artificial em diagn\u00f3stico e ferramentas digitais para pacientes.",
    "programs.card2.link": "Mais informa\u00e7\u00f5es",
    "programs.card3.tag": "Forma\u00e7\u00e3o",
    "programs.card3.title": "Educa\u00e7\u00e3o M\u00e9dica Continuada",
    "programs.card3.desc": "Programas de forma\u00e7\u00e3o continuada para m\u00e9dicos, enfermeiros e profissionais de sa\u00fade. Oficinas, semin\u00e1rios e recursos atualizados.",
    "programs.card3.link": "Mais informa\u00e7\u00f5es",

    // Valores
    "values.label": "Nossos Valores",
    "values.title": "O que nos define",
    "values.desc": "Cada decis\u00e3o que tomamos \u00e9 guiada por estes princ\u00edpios fundamentais.",
    "values.v1.title": "Educa\u00e7\u00e3o Acess\u00edvel",
    "values.v1.desc": "Acreditamos que o conhecimento m\u00e9dico deve estar ao alcance de todos, sem barreiras.",
    "values.v2.title": "Compaix\u00e3o",
    "values.v2.desc": "Cada paciente merece ser tratado com dignidade, empatia e respeito.",
    "values.v3.title": "Inova\u00e7\u00e3o",
    "values.v3.desc": "Abra\u00e7amos a tecnologia como ferramenta para melhorar o atendimento em sa\u00fade.",
    "values.v4.title": "Crescimento",
    "values.v4.desc": "Estamos comprometidos com o aprendizado cont\u00ednuo e a melhoria constante.",

    // CTA Banner
    "cta.title": "Junte-se \u00e0 nossa comunidade educacional",
    "cta.desc": "Fa\u00e7a parte de uma rede de profissionais comprometidos com a sa\u00fade renal e a educa\u00e7\u00e3o m\u00e9dica de qualidade.",
    "cta.btn": "Fale conosco hoje",

    // Contato
    "contact.label": "Contato",
    "contact.title": "Vamos falar sobre educa\u00e7\u00e3o m\u00e9dica",
    "contact.desc": "Estamos aqui para responder suas perguntas sobre nossos programas educacionais, colabora\u00e7\u00f5es e oportunidades.",
    "contact.email.title": "E-mail",
    "contact.web.title": "Site",
    "contact.location.title": "Localiza\u00e7\u00e3o",
    "contact.location.desc": "Educa\u00e7\u00e3o m\u00e9dica sem fronteiras",
    "contact.form.name": "Nome",
    "contact.form.name.ph": "Seu nome",
    "contact.form.email": "E-mail",
    "contact.form.email.ph": "voce@email.com",
    "contact.form.subject": "Assunto",
    "contact.form.subject.ph": "Sobre o que voc\u00ea gostaria de falar?",
    "contact.form.message": "Mensagem",
    "contact.form.message.ph": "Escreva sua mensagem aqui...",
    "contact.form.submit": "Enviar mensagem",

    // Footer
    "footer.desc": "Plataforma de educa\u00e7\u00e3o m\u00e9dica dedicada \u00e0 sa\u00fade renal, nefrologia e inova\u00e7\u00e3o em sa\u00fade digital.",
    "footer.nav.title": "Navega\u00e7\u00e3o",
    "footer.nav.inicio": "In\u00edcio",
    "footer.nav.nosotros": "Sobre N\u00f3s",
    "footer.nav.programas": "Programas",
    "footer.nav.valores": "Valores",
    "footer.programs.title": "Programas",
    "footer.programs.renal": "Sa\u00fade Renal",
    "footer.programs.digital": "Sa\u00fade Digital",
    "footer.programs.edu": "Educa\u00e7\u00e3o M\u00e9dica",
    "footer.programs.research": "Pesquisa",
    "footer.contact.title": "Contato",
    "footer.contact.email": "E-mail",
    "footer.contact.web": "Site",
    "footer.copy": "\u00a9 2026 Ra\u00edces M\u00e9dicas. Todos os direitos reservados.",

    // Visitor Counter
    "counter.label": "Obrigado por ser o visitante n\u00famero",

    // Meta
    "meta.title": "Ra\u00edces M\u00e9dicas | Educa\u00e7\u00e3o M\u00e9dica e Sa\u00fade Renal",
    "meta.description": "Ra\u00edces M\u00e9dicas: plataforma de educa\u00e7\u00e3o m\u00e9dica, sa\u00fade renal e inova\u00e7\u00e3o em sa\u00fade digital."
  }
};

const LOCALE_MAP = { es: "es-MX", en: "en-US", pt: "pt-BR" };

function getCurrentLang() {
  return localStorage.getItem("rm-lang") || "es";
}

function setLang(lang) {
  if (!translations[lang]) return;
  localStorage.setItem("rm-lang", lang);
  document.documentElement.lang = lang;

  // Update page title and meta description
  document.title = translations[lang]["meta.title"];
  var metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", translations[lang]["meta.description"]);

  // Update all elements with data-i18n attribute
  document.querySelectorAll("[data-i18n]").forEach(function(el) {
    var key = el.getAttribute("data-i18n");
    var val = translations[lang][key];
    if (val !== undefined) {
      el.textContent = val;
    }
  });

  // Update all elements with data-i18n-placeholder attribute
  document.querySelectorAll("[data-i18n-placeholder]").forEach(function(el) {
    var key = el.getAttribute("data-i18n-placeholder");
    var val = translations[lang][key];
    if (val !== undefined) {
      el.setAttribute("placeholder", val);
    }
  });

  // Update hero title (has inline <span> elements)
  var heroTitle = document.getElementById("hero-title");
  if (heroTitle) {
    heroTitle.innerHTML =
      translations[lang]["hero.title.1"] +
      '<span>' + translations[lang]["hero.title.accent1"] + '</span>' +
      translations[lang]["hero.title.2"] +
      '<span>' + translations[lang]["hero.title.accent2"] + '</span>';
  }

  // Update error message (has inline <a> element)
  var errorEl = document.getElementById("ue-error");
  if (errorEl) {
    errorEl.innerHTML = '<p>' + translations[lang]["episodio.error"] +
      '<a href="https://www.youtube.com/@raicesmedicas" target="_blank" rel="noopener">' +
      translations[lang]["episodio.error.link"] + '</a></p>';
  }

  // Update video date locale if video is loaded
  var dateEl = document.getElementById("ue-video-date");
  if (dateEl && dateEl.dataset.published) {
    var date = new Date(dateEl.dataset.published);
    dateEl.textContent = date.toLocaleDateString(LOCALE_MAP[lang], {
      year: "numeric", month: "long", day: "numeric"
    });
  }

  // Update language selector active state
  document.querySelectorAll(".lang-btn").forEach(function(btn) {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });
}

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", function() {
  var lang = getCurrentLang();
  setLang(lang);

  // Bind language buttons
  document.querySelectorAll(".lang-btn").forEach(function(btn) {
    btn.addEventListener("click", function(e) {
      e.preventDefault();
      setLang(btn.dataset.lang);
    });
  });
});

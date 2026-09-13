/*
  Change request 2026-09-13, section 4.5. The MDI course outline, transcribed
  from the published copy at cdie.co.ke/mdi/.

  Source note. This is the copy the client supplied as authoritative for this
  item. It is the live site, not the Actual Copy tab that AGENTS.md names for
  words, so where the two ever disagree the Actual Copy tab still wins.

  Corrections applied to the source, all plain spelling errors, none of which
  change a fact. Listed so they can be checked rather than trusted:
    regulartory   -> regulatory        (BME 811)
    undestanding  -> understanding     (BME 817)
    spplication   -> application       (BME 817)
    continous     -> continuous        (BME 817)
    Niomaterials  -> Biomaterials      (BME 820)
    intergrating  -> integrating       (BME 822)
    intergrate    -> integrate         (BME 830)
    medicals      -> medical           (BME 830)
    intergration  -> integration       (ECU 801)

  Nothing else is edited. No unit is added, renamed or reordered.
*/

import type { Semester } from "./types";

export const mdiSemesters: Semester[] = [
  {
    id: "semester-1",
    name: "Semester 1",
    courses: [
      {
        code: "BME 810",
        title: "Clinical Immersion & Needs Finding",
        body: "The clinical and industry immersion course provides students with hands-on experience in diverse clinical settings including hospitals and operating rooms, where they systematically identify unmet medical device needs. Through interdisciplinary collaboration with healthcare professionals, students will learn to prioritize observations, ensuring that proposed medical device solutions have both significant clinical impact and commercial viability.",
      },
      {
        code: "BME 812",
        title: "Business & Entrepreneurship for Healthcare Innovation",
        body: "Equips students with the skills to develop comprehensive business plans, evaluate financial models and perform market analysis for new medical devices. Students will learn about the entrepreneurial landscape, including funding sources and intellectual property protection, to determine the commercial viability and strategic path for bringing innovations to market.",
      },
      {
        code: "BME 814",
        title: "Biomedical Device Design 1",
        body: "Equips students with a comprehensive understanding of the biomedical device process, from concept development to design validation. Through case study analysis and hands-on application of design techniques, students will learn to navigate design challenges specific to healthcare needs, particularly in the context of the Kenyan and African markets.",
      },
      {
        code: "BME 816",
        title: "Prototyping & Fabrication 1",
        body: "Provides hands-on experience in creating functional biomedical prototypes using techniques such as 3D printing, CNC machining and laser cutting. Students will also learn CAD design and material selection, and explore emerging healthcare technologies such as A.I., telemedicine and wearables, applying them to biomedical innovations.",
      },
      {
        code: "BME 818",
        title: "Professional Development & Communication",
        body: "Equips students with the skills to build strong professional networks, optimize their resumes and navigate the job search process. Students will enhance their communication and presentation abilities, preparing them to present their ideas and research effectively in diverse professional settings.",
      },
      {
        title: "Technical Elective",
        body: "An opportunity for non-engineering students to ramp up on any engineering class, and for engineering students to ramp up on their physiology and anatomy knowledge.",
      },
    ],
  },
  {
    id: "semester-2",
    name: "Semester 2",
    courses: [
      {
        code: "BME 811",
        title: "Biomedical Device Design II",
        body: "Guides students through the full design process of biomedical devices. An advanced course building on Biomedical Device Design I, it emphasizes human-centered design, regulatory compliance and interdisciplinary collaboration. Students will develop a project that meets the needs of patients, healthcare providers and industry standards, and will select their final project in this class.",
      },
      {
        code: "BME 813",
        title: "Global Regulatory Strategies for Medical Technologies",
        body: "Provides a comprehensive understanding of global regulatory bodies and their historical evolution. Students will critically analyze global regulatory frameworks and develop knowledge of the Kenyan context, understanding how to navigate local compliance processes and the role of government agencies in medical device approval.",
      },
      {
        code: "BME 815",
        title: "Project Management in Healthcare",
        body: "Equips students with the skills to plan, execute and manage healthcare projects, focusing on scope, timeline and risk management. Students will also learn to lead interdisciplinary teams, manage budgets and ensure compliance with quality and regulatory standards throughout the project lifecycle.",
      },
      {
        code: "BME 817",
        title: "Quality Management Systems",
        body: "Provides a thorough understanding of essential quality standards such as ISO 13485 and ASTM standards, and their application in the medical device industry. Students will learn to develop quality manuals, implement risk management strategies and conduct audits, ensuring ongoing compliance and continuous improvement.",
      },
      {
        code: "BME 819",
        title: "Physiology for Engineers",
        body: "Provides a comprehensive understanding of human body systems and their importance to biomedical engineering. Through engineering principles and real-world case studies, students will learn to design medical devices and innovations compatible with the complex physiological environment of the human body.",
      },
      {
        code: "ECU 801",
        title: "Quantitative Methods for Engineering & Technology",
        body: "Descriptive statistics; probability theory and distributions; estimation of parameters; extreme value analysis; distribution classes; return period; analysis at different time scales and aggregation levels; regression and correlation; model calibration; validation; sensitivity and uncertainty analysis; residual analysis; variance decomposition; uncertainty sources in mathematical modelling; time series analysis; numerical techniques for interpolation, differentiation and integration, least squares fitting and optimization techniques.",
      },
    ],
  },
  {
    id: "semester-3",
    name: "Semester 3",
    courses: [
      {
        code: "BME 820",
        title: "Advanced Biomaterials",
        body: "Provides an in-depth understanding of biomaterials principles, focusing on structure-property relationships of materials used in medical applications. Students will analyze and select biomaterials for specific uses, applying their knowledge to develop medical devices, implants and tissue engineering solutions while critically assessing current research.",
      },
      {
        code: "BME 822",
        title: "Industry Seminar",
        body: "Exposes students to a range of topics through talks by entrepreneurs, venture capitalists and industry leaders, integrating real-world insights with academic learning in biomedical innovation. Students will also enhance their networking skills, building professional relationships and exploring career opportunities in the field.",
      },
      {
        code: "BME 830",
        title: "M.Sc. Project",
        body: "The student demonstrates mastery of the curriculum by developing a prototype that integrates the knowledge and skills acquired throughout the programme. They will create a business plan outlining market analysis and commercialization strategies, and a quality and regulatory plan for bringing a medical device to market. From an engineering perspective they will design a validated mid-to-high fidelity prototype that addresses an identified problem, selected through rigorous needs finding and screening.",
      },
      {
        code: "ECU 802",
        title: "Philosophy of Engineering, Technology and Innovation",
        body: "Explores the historical evolution of engineering and technology and their impact on society and culture, covering philosophical foundations, ethical considerations and the relationship between innovation and societal change, while developing critical thinking and applying these principles to real-world challenges.",
      },
      {
        title: "General Elective",
        body: "An opportunity to take a class of the student's choosing to enhance their knowledge.",
      },
    ],
  },
];

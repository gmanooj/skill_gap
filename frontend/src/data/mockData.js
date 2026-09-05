export const initialStudentData = {
  id: "std_101",
  name: "Alex Morgan",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
  title: "Junior Software Engineer",
  targetRole: "Full Stack Cloud Engineer",
  email: "alex.morgan@techbridge.edu",
  education: "B.S. Computer Science, University of Technology (2024)",
  gpa: "3.85 / 4.0",
  experienceYears: 1.5,
  location: "San Francisco, CA (Remote Friendly)",
  bio: "Passionate developer focusing on modern web frameworks and distributed cloud applications. Eager to bridge the gap into senior full-stack and cloud-native architecture.",
  socials: {
    github: "github.com/alexmorgan-dev",
    linkedin: "linkedin.com/in/alexmorgan",
    portfolio: "alexmorgan.dev"
  },
  certifications: [
    { id: "c1", name: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services", date: "Jan 2024", badge: "Cloud Foundational" },
    { id: "c2", name: "Meta Front-End Developer Certificate", issuer: "Meta / Coursera", date: "Nov 2023", badge: "Frontend Expert" }
  ],
  skills: [
    { name: "JavaScript / ES6+", category: "Frontend", level: 90, status: "Mastered" },
    { name: "React & Next.js", category: "Frontend", level: 85, status: "Mastered" },
    { name: "TypeScript", category: "Frontend", level: 75, status: "Proficient" },
    { name: "HTML5 / Modern CSS", category: "Frontend", level: 95, status: "Mastered" },
    { name: "Node.js & Express", category: "Backend", level: 78, status: "Proficient" },
    { name: "RESTful API Design", category: "Backend", level: 82, status: "Proficient" },
    { name: "PostgreSQL & SQL", category: "Database", level: 70, status: "Proficient" },
    { name: "MongoDB", category: "Database", level: 65, status: "Developing" },
    { name: "Git & GitHub CI", category: "DevOps", level: 80, status: "Proficient" },
    { name: "Docker", category: "DevOps", level: 40, status: "Beginner" },
    { name: "Kubernetes", category: "DevOps", level: 15, status: "Novice" },
    { name: "AWS (EC2, S3, Lambda)", category: "Cloud", level: 50, status: "Developing" },
    { name: "GraphQL", category: "Backend", level: 30, status: "Beginner" },
    { name: "System Design", category: "Architecture", level: 45, status: "Developing" },
    { name: "Unit & Integration Testing", category: "Quality", level: 60, status: "Developing" },
    { name: "Agile / Scrum Collaboration", category: "Soft Skills", level: 88, status: "Mastered" }
  ]
};

export const jobRoles = [
  {
    id: "fullstack-cloud",
    title: "Full Stack Cloud Engineer",
    department: "Engineering",
    industry: "SaaS & Cloud Platforms",
    level: "Mid-to-Senior",
    salaryRange: "$130,000 - $165,000",
    openings: "1,420 Active Roles",
    marketGrowth: "+24% YoY Growth",
    description: "Build robust, highly scalable microservices and dynamic user interfaces deployed on modern cloud infrastructure (AWS/GCP, Docker, Kubernetes).",
    requiredSkills: [
      { name: "JavaScript / ES6+", requiredLevel: 85, weight: "Critical", category: "Frontend" },
      { name: "React & Next.js", requiredLevel: 85, weight: "Critical", category: "Frontend" },
      { name: "TypeScript", requiredLevel: 80, weight: "High", category: "Frontend" },
      { name: "Node.js & Express", requiredLevel: 80, weight: "Critical", category: "Backend" },
      { name: "RESTful API Design", requiredLevel: 85, weight: "Critical", category: "Backend" },
      { name: "PostgreSQL & SQL", requiredLevel: 75, weight: "High", category: "Database" },
      { name: "Docker", requiredLevel: 75, weight: "Critical", category: "DevOps" },
      { name: "Kubernetes", requiredLevel: 65, weight: "High", category: "DevOps" },
      { name: "AWS (EC2, S3, Lambda)", requiredLevel: 75, weight: "Critical", category: "Cloud" },
      { name: "System Design", requiredLevel: 70, weight: "High", category: "Architecture" },
      { name: "Unit & Integration Testing", requiredLevel: 75, weight: "Medium", category: "Quality" },
      { name: "GraphQL", requiredLevel: 60, weight: "Medium", category: "Backend" }
    ],
    responsibilities: [
      "Architect and implement scalable full-stack web applications with React, Node.js, and TypeScript.",
      "Containerize microservices using Docker and orchestrate workloads with Kubernetes on AWS.",
      "Design low-latency REST & GraphQL APIs and manage relational database schemas with PostgreSQL.",
      "Implement CI/CD deployment pipelines and automated test coverage across test suites."
    ]
  },
  {
    id: "ai-ml-engineer",
    title: "AI / Machine Learning Engineer",
    department: "Applied AI",
    industry: "Generative AI & Data Systems",
    level: "Mid-Senior",
    salaryRange: "$150,000 - $195,000",
    openings: "2,150 Active Roles",
    marketGrowth: "+42% YoY Growth",
    description: "Design, fine-tune, and deploy production-grade LLM applications, retrieval-augmented generation (RAG) pipelines, and intelligent data services.",
    requiredSkills: [
      { name: "Python & PyTorch", requiredLevel: 90, weight: "Critical", category: "AI/ML" },
      { name: "LLM Orchestration (LangChain/LlamaIndex)", requiredLevel: 85, weight: "Critical", category: "AI/ML" },
      { name: "Vector Databases & RAG", requiredLevel: 80, weight: "High", category: "AI/ML" },
      { name: "FastAPI & Microservices", requiredLevel: 80, weight: "High", category: "Backend" },
      { name: "Docker & Containerization", requiredLevel: 75, weight: "High", category: "DevOps" },
      { name: "Cloud ML Deployment (AWS SageMaker/GCP Vertex)", requiredLevel: 70, weight: "Critical", category: "Cloud" }
    ],
    responsibilities: [
      "Build high-performance AI agents and RAG vector search pipelines.",
      "Deploy scalable FastAPI endpoints serving transformer model inference.",
      "Evaluate model performance, accuracy benchmarks, and cost-latency tradeoffs."
    ]
  },
  {
    id: "devops-cloud-architect",
    title: "Cloud DevOps & Platform Engineer",
    department: "Infrastructure & Security",
    industry: "Enterprise Cloud Infrastructure",
    level: "Senior",
    salaryRange: "$145,000 - $185,000",
    openings: "980 Active Roles",
    marketGrowth: "+19% YoY Growth",
    description: "Spearhead multi-cloud infrastructure automation, Kubernetes clusters, zero-trust security postures, and observability pipelines.",
    requiredSkills: [
      { name: "Terraform & IaC", requiredLevel: 85, weight: "Critical", category: "DevOps" },
      { name: "Kubernetes & Helm", requiredLevel: 85, weight: "Critical", category: "DevOps" },
      { name: "Docker", requiredLevel: 90, weight: "Critical", category: "DevOps" },
      { name: "AWS / GCP Solutions Architecture", requiredLevel: 85, weight: "Critical", category: "Cloud" },
      { name: "CI/CD & GitHub Actions", requiredLevel: 85, weight: "High", category: "DevOps" },
      { name: "Prometheus & Grafana Observability", requiredLevel: 75, weight: "Medium", category: "DevOps" }
    ],
    responsibilities: [
      "Provision reproducible multi-region infrastructure using Terraform.",
      "Manage production Kubernetes clusters with GitOps workflows.",
      "Ensure 99.99% uptime and implement disaster recovery systems."
    ]
  }
];

export const recommendationsData = [
  {
    id: "rec_1",
    skill: "Docker & Containerization",
    priority: "Urgent",
    category: "DevOps",
    gapPercentage: 35,
    estimatedHours: 18,
    courseTitle: "Docker for Node.js & Full-Stack Developers Masterclass",
    provider: "Udemy",
    instructor: "Bret Fisher (Docker Captain)",
    rating: 4.8,
    reviewsCount: "14.2k",
    level: "Beginner to Intermediate",
    duration: "12 hours on-demand video",
    cost: "$19.99",
    url: "https://www.udemy.com",
    keyOutcomes: [
      "Multi-stage Dockerfiles for React and Node.js production images",
      "Docker Compose for local database & caching orchestration",
      "Container security and minimal alpine base images"
    ],
    recommendedProject: "Containerize a full MERN/PERN application with hot reloading and production Docker-Compose build."
  },
  {
    id: "rec_2",
    skill: "Kubernetes Microservices",
    priority: "Urgent",
    category: "DevOps",
    gapPercentage: 50,
    estimatedHours: 28,
    courseTitle: "Certified Kubernetes Administrator (CKA) with Hands-on Labs",
    provider: "Coursera / KodeKloud",
    instructor: "Mumshad Mannambeth",
    rating: 4.9,
    reviewsCount: "28.5k",
    level: "Intermediate",
    duration: "22 hours",
    cost: "Free with Coursera Plus",
    url: "https://www.coursera.org",
    keyOutcomes: [
      "Deployments, Pods, Services, Ingress Controllers, and ConfigMaps",
      "Cluster scaling, Rolling updates, and self-healing mechanisms",
      "Helm charts for structured application deployments"
    ],
    recommendedProject: "Deploy a multi-service web app with Ingress routing, horizontal pod autoscaling (HPA), and persistent volumes on Minikube."
  },
  {
    id: "rec_3",
    skill: "AWS Cloud Solutions (EC2, S3, Lambda, RDS)",
    priority: "High",
    category: "Cloud",
    gapPercentage: 25,
    estimatedHours: 24,
    courseTitle: "AWS Certified Solutions Architect - Associate Complete Course",
    provider: "A Cloud Guru / Pluralsight",
    instructor: "Stephane Maarek",
    rating: 4.9,
    reviewsCount: "62.1k",
    level: "Intermediate",
    duration: "27 hours",
    cost: "$24.99",
    url: "https://www.pluralsight.com",
    keyOutcomes: [
      "Serverless architecture with AWS Lambda & API Gateway",
      "VPC networking, Subnets, Security Groups, and IAM roles",
      "Automated S3 static asset delivery with CloudFront CDN"
    ],
    recommendedProject: "Build an event-driven serverless image processing pipeline using S3 triggers, Lambda, and DynamoDB."
  },
  {
    id: "rec_4",
    skill: "System Design & Distributed Architecture",
    priority: "High",
    category: "Architecture",
    gapPercentage: 25,
    estimatedHours: 20,
    courseTitle: "Grokking Modern System Design for Software Engineers",
    provider: "Educative.io",
    instructor: "Design Gurus",
    rating: 4.7,
    reviewsCount: "9.8k",
    level: "Intermediate to Advanced",
    duration: "18 hours interactive",
    cost: "Interactive Subscription",
    url: "https://www.educative.io",
    keyOutcomes: [
      "Load balancing, Caching strategies (Redis/Memcached), and CDN placement",
      "Database sharding, CAP Theorem, and asynchronous messaging (Kafka/RabbitMQ)",
      "High-level architecture for URL shortener, Twitter timeline, and YouTube stream"
    ],
    recommendedProject: "Design and document a high-concurrency rate limiter service with Redis token-bucket algorithm."
  },
  {
    id: "rec_5",
    skill: "GraphQL API Design",
    priority: "Medium",
    category: "Backend",
    gapPercentage: 30,
    estimatedHours: 12,
    courseTitle: "Building Modern GraphQL APIs with Apollo Server & TypeScript",
    provider: "Frontend Masters",
    instructor: "Scott Moss",
    rating: 4.8,
    reviewsCount: "4.5k",
    level: "Intermediate",
    duration: "6.5 hours",
    cost: "$39/mo",
    url: "https://frontendmasters.com",
    keyOutcomes: [
      "GraphQL schemas, resolvers, mutations, and query subscriptions",
      "N+1 problem mitigation using DataLoader batching",
      "Type safety integration with GraphQL Code Generator"
    ],
    recommendedProject: "Convert a RESTful blogging API into a federated GraphQL gateway with authentication middleware."
  }
];

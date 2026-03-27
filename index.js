const express = require("express");
const {createCanvas} = require("canvas");
const fs = require("fs")
const canvas = createCanvas(800,400)
const ctx = canvas.getContext("2d")
const mongoose = require("mongoose")
require("dotenv").config();
mongoose.connect(process.env.MONGODB_URI).then(()=>{
    console.log("Connected to db");
    
}).catch((err)=>{
    console.log(err);
})
const app = express();
const {Counter} = require("./Counter.js")
const PORT = 5000;
const {GoogleGenAI} = require("@google/genai")
const ai = new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TELEGRAM_BOT_API;
const targetChannelId = process.env.TARGET_CHANNEL_ID;
const prompt = `
Give answer in the below format:

<b><Topic as a question></b>
<Simple, clear explanation in few lines>

Rules:
- Keep it beginner-friendly
- explain working
- If it solves some problem mention
- Avoid long paragraphs
- Don't give any real world examples tell acually what happens
- Make it look like human-written notes
- No unnecessary complexity
- Don't include any ai related sentences
- dont write like a paragraph
- if necessary explain use case with simple scenario
- give in html format which is suitable for telegram message and characters should be less than 800
`
const techJargons = [
  // 🔥 Trending / Industry Buzz
  "Artificial Intelligence",
  "Machine Learning",
  "Deep Learning",
  "Generative AI",
  "Large Language Models",
  "Prompt Engineering",
  "RAG (Retrieval Augmented Generation)",
  "Vector Database",
      "Big Data",
  "Embeddings",
  "Fine Tuning",
  "MLOps",
  "Data Science",

  "Cloud Computing",
  "Serverless",
  "Edge Computing",
  "Web3",
  "Blockchain",
  "Smart Contracts",
  "Microservices",
  "System Design",
  "Scalability",
  "High Availability",
  "Fault Tolerance",
  "Event Driven Architecture",
  "DevOps",
  "CI/CD",
  "Observability",
  "Telemetry",

  // 🧠 Core Systems (Real-world dev terms)
  "Operating System",
  "Kernel",
  "Process",
  "Thread",
  "Concurrency",
  "Parallelism",
  "Deadlock",
  "Race Condition",
  "Context Switching",
  "Memory Leak",
  "Garbage Collection",
  "Heap",
  "Stack Memory",
  "Buffer",
  "Buffer Overflow",
  "Cache",
  "Cache Invalidation",
  "Cold Start",
  "Warm Start",
  "System Call",
  "I/O Bound",
  "CPU Bound",

  // 🌐 Networking (practical dev terms)
  "TCP/IP",
  "HTTP",
  "HTTPS",
  "REST",
  "GraphQL",
  "gRPC",
  "WebSockets",
  "Polling",
  "Long Polling",
  "DNS",
  "CDN",
  "Reverse Proxy",
  "Forward Proxy",
  "Load Balancer",
  "Rate Limiting",
  "Throttling",
  "Latency",
  "Throughput",

  // 🗄️ Database (very practical)
  "SQL",
  "NoSQL",
  "ORM",
  "Query Optimization",
  "Index",
  "Transaction",
  "ACID",
  "CAP Theorem",
  "Sharding",
  "Replication",
  "Eventual Consistency",
  "Strong Consistency",
  "Database Lock",
  "Deadlock (DB)",
  "Connection Pooling",
  "N+1 Problem",

  // 💻 Backend / API dev
  "API",
  "REST API",
  "GraphQL API",
  "Endpoint",
  "Middleware",
  "Serialization",
  "Deserialization",
  "DTO",
  "Validation",
  "Authentication",
  "Authorization",
  "JWT",
  "OAuth",
  "Session",
  "Cookie",
  "CORS",
  "Idempotency",

  // 🌍 Frontend (real dev usage)
  "DOM",
  "Virtual DOM",
  "Reconciliation",
  "Hydration",
  "CSR (Client Side Rendering)",
  "SSR (Server Side Rendering)",
  "SSG (Static Site Generation)",
  "Lazy Loading",
  "Code Splitting",
  "Bundling",
  "Tree Shaking",
  "Event Loop",
  "Call Stack",
  "Hoisting",
  "Closure",
  "Debouncing",
  "Throttling",

  // ⚙️ DevOps / Infra (real world)
  "Docker",
  "Container",
  "Kubernetes",
  "Pod",
  "Cluster",
  "Orchestration",
  "Infrastructure as Code",
  "Terraform",
  "Ansible",
  "Jenkins",
  "GitHub Actions",
  "CI/CD Pipeline",
  "Build",
  "Artifact",
  "Deployment",
  "Rollback",
  "Blue Green Deployment",
  "Canary Release",
  "Auto Scaling",
  "Load Testing",
  "Stress Testing",

  // 🔐 Security (practical attacks/dev)
  "Encryption",
  "Decryption",
  "Hashing",
  "Salting",
  "SSL/TLS",
  "HTTPS",
  "JWT",
  "OAuth",
  "XSS",
  "CSRF",
  "SQL Injection",
  "Clickjacking",
  "Rate Limiting",
  "Zero Trust",

  // 🧩 Programming (actual dev jargon)
  "Runtime",
  "Compiler",
  "Interpreter",
  "JIT",
  "Garbage Collector",
  "Memory Allocation",
  "Pointer",
  "Reference",
  "Immutable",
  "Mutable",
  "Synchronous",
  "Asynchronous",
  "Callback",
  "Promise",
  "Async/Await",
  "Blocking",
  "Non Blocking",

  // 🧠 Architecture / design
  "Monolith",
  "Microservices",
  "Service Discovery",
  "API Gateway",
  "Message Queue",
  "Pub/Sub",
  "Kafka",
  "RabbitMQ",
  "Circuit Breaker",
  "Bulkhead",
  "Saga Pattern",
  "CQRS",
  "Event Sourcing",

  // 📊 Data / ML (practical)
  "Dataset",
  "Training",
  "Inference",
  "Model",
  "Overfitting",
  "Underfitting",
  "Bias",
  "Variance",
  "Feature",
  "Feature Engineering",
  "Label",
  "Prediction",
  "Accuracy",
  "Precision",
  "Recall",
  "F1 Score",
  "Confusion Matrix",
  "Gradient Descent",
  "Backpropagation",

  // 🛠️ Tools / ecosystem (very used terms)
  "Git",
  "Repository",
  "Commit",
  "Branch",
  "Merge",
  "Rebase",
  "Conflict",
  "Pull Request",
  "Code Review",
  "Linting",
  "Formatting",
  "Build Tool",
  "Package Manager",
  "Dependency",
  "Versioning",
  "Semantic Versioning",

  // 📌 Algorithms (end)
  "Algorithm",
  "Time Complexity",
  "Space Complexity",
  "Big O",
  "Binary Search",
  "Sorting",
  "Recursion",
  "Dynamic Programming",
  "Greedy",
  "Backtracking",

  // 📌 Data Structures (very last)
  "Array",
  "Linked List",
  "Stack",
  "Queue",
  "Deque",
  "Tree",
  "Binary Tree",
  "BST",
  "Heap",
  "Trie",
  "Graph",
  "Hash Map",
  "Set"
];

const styles = [
  { gradient: ["#0f2027", "#2c5364"], text: "#ffffff" }, // deep blue
  { gradient: ["#1e3c72", "#2a5298"], text: "#ffffff" }, // royal blue
  { gradient: ["#232526", "#414345"], text: "#ffffff" }, // dark grey
  { gradient: ["#000000", "#434343"], text: "#ffffff" }, // black fade
  { gradient: ["#141E30", "#243B55"], text: "#ffffff" }, // navy
  { gradient: ["#373B44", "#4286f4"], text: "#ffffff" }, // blue pop

  { gradient: ["#ff512f", "#dd2476"], text: "#ffffff" }, // orange pink
  { gradient: ["#f12711", "#f5af19"], text: "#000000" }, // fire
  { gradient: ["#fc466b", "#3f5efb"], text: "#ffffff" }, // pink blue
  { gradient: ["#ff7e5f", "#feb47b"], text: "#000000" }, // soft orange
  { gradient: ["#ff9966", "#ff5e62"], text: "#ffffff" }, // coral

  { gradient: ["#00c6ff", "#0072ff"], text: "#ffffff" }, // sky blue
  { gradient: ["#2193b0", "#6dd5ed"], text: "#000000" }, // aqua
  { gradient: ["#56ccf2", "#2f80ed"], text: "#ffffff" }, // fresh blue
  { gradient: ["#36d1dc", "#5b86e5"], text: "#ffffff" }, // cyan blue

  { gradient: ["#11998e", "#38ef7d"], text: "#000000" }, // green mint
  { gradient: ["#00b09b", "#96c93d"], text: "#000000" }, // fresh green
  { gradient: ["#134E5E", "#71B280"], text: "#ffffff" }, // forest
  { gradient: ["#76b852", "#8DC26F"], text: "#000000" }, // soft green

  { gradient: ["#8E2DE2", "#4A00E0"], text: "#ffffff" }, // purple
  { gradient: ["#DA22FF", "#9733EE"], text: "#ffffff" }, // neon purple
  { gradient: ["#654ea3", "#eaafc8"], text: "#000000" }, // lavender
  { gradient: ["#cc2b5e", "#753a88"], text: "#ffffff" }, // magenta

  { gradient: ["#ee9ca7", "#ffdde1"], text: "#000000" }, // soft pink
  { gradient: ["#fbd3e9", "#bb377d"], text: "#000000" }, // pastel
  { gradient: ["#ffecd2", "#fcb69f"], text: "#000000" }, // warm pastel

  { gradient: ["#3a1c71", "#d76d77"], text: "#ffffff" }, // dramatic
  { gradient: ["#42275a", "#734b6d"], text: "#ffffff" }, // dark purple
  { gradient: ["#bdc3c7", "#2c3e50"], text: "#ffffff" }, // silver dark
];
const getCurrentIndex = async() => {
    let counter = await Counter.findOne({name:"techJargonIndex"})
    if(!counter){
        counter = await Counter.create({name:"techJargonIndex",index:0})
    }
    return counter.index;
}
const generateExplaination = async(topic)=>{
      const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Topic " + topic + prompt
  });
  return response.text;
}

const incrementIndex = async() =>{
    await Counter.findOneAndUpdate(
        {name:"techJargonIndex"},
        {$inc:{index:1}},
        {returnDocument:"after",upsert:true}
    )
}

function drawCenteredWrappedText(ctx, text, canvasWidth, canvasHeight) {
  const maxWidth = canvasWidth - 100; // padding

  // 🔹 1. Auto font size
  let fontSize = 60;

  while (fontSize > 20) {
    ctx.font = `bold ${fontSize}px Arial`;
    if (ctx.measureText(text).width <= maxWidth) break;
    fontSize -= 2;
  }

  ctx.font = `bold ${fontSize}px Arial`;


  const words = text.split(" ");
  let lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const testLine = currentLine + " " + words[i];
    const width = ctx.measureText(testLine).width;

    if (width < maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = words[i];
    }
  }
  lines.push(currentLine)
  const lineHeight = fontSize + 10;
  const totalHeight = lines.length * lineHeight;
  const startY = canvasHeight / 2 - totalHeight / 2;

  ctx.textAlign = "center";

  lines.forEach((line, i) => {
    ctx.fillText(line, canvasWidth / 2, startY + i * lineHeight);
  });
}
app.get("/",(req,res)=>{
    res.send("healthy");
})
app.get("/send-next",async (req,res)=>{
    const currentTopicIndex = await getCurrentIndex();
    const topic = techJargons[currentTopicIndex];
    if(!topic){
        console.log("No more topics")
        return;
    }
    const style = styles[Math.floor(Math.random() * styles.length)]
    const gradient = ctx.createLinearGradient(0,0,800,400);
    gradient.addColorStop(0,style.gradient[0])
    gradient.addColorStop(1,style.gradient[1]);

    ctx.fillStyle = gradient;
    ctx.fillRect(0,0,800,400)

    ctx.fillStyle=style.text;
    ctx.font = "bold 50px Arial"
    ctx.textAlign= "center"
    if(ctx.measureText(techJargons[currentTopicIndex]).width <= 700){
        ctx.fillText(techJargons[currentTopicIndex],400,200);
    }else{
    drawCenteredWrappedText(ctx,techJargons[currentTopicIndex],800,400)

    }

    ctx.fillStyle=style.text;
    ctx.font = "bold 20px Arial"
    ctx.textAlign= "center"
    ctx.fillText("https://t.me/tech_jargon_decoded",400,350);

    const buffer = canvas.toBuffer("image/png")
    fs.writeFileSync("./src/img-"+currentTopicIndex+".png",buffer)
    const explaination =await generateExplaination(topic);
    if(explaination.length){
        const bot = new TelegramBot(token, {polling: false});
    
        await bot.sendPhoto(targetChannelId,"./src/img-"+currentTopicIndex+".png",{
            caption:explaination,
            parse_mode:"HTML"
        })
        incrementIndex();
        return res.status(200).send("Success");
    }

    return res.status(400).send("Failed");
})
app.listen(PORT,()=>{
    console.log("Listening on port: "+PORT);
})

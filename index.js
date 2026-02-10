// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json());
app.use(cors());

// --- CONFIGURATION ---
// REPLACE WITH YOUR ACTUAL EMAIL
const OFFICIAL_EMAIL = "shresth2368.be23@chitkara.edu.in"; 

// Initialize Google Gemini API
// You need to set GEMINI_API_KEY in your environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// --- HELPER FUNCTIONS ---

// Fibonacci: Generate n terms
const getFibonacci = (n) => {
    if (typeof n !== 'number' || n <= 0) return [];
    if (n === 1) return [0];
    let seq = [0, 1];
    while (seq.length < n) {
        seq.push(seq[seq.length - 1] + seq[seq.length - 2]);
    }
    return seq.slice(0, n);
};

// Prime Check
const isPrime = (num) => {
    if (num <= 1) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return false;
    }
    return true;
};

// GCD (for HCF/LCM)
const gcd = (a, b) => (!b ? a : gcd(b, a % b));

// LCM
const lcm = (a, b) => (a * b) / gcd(a, b);

// --- ENDPOINTS ---

// GET /health [cite: 23, 94]
app.get('/health', (req, res) => {
    res.status(200).json({
        "is_success": true,
        "official_email": OFFICIAL_EMAIL
    });
});

// POST /bfhl [cite: 22, 30]
app.post('/bfhl', async (req, res) => {
    try {
        const body = req.body;
        let responseData = null;
        
        // Determine which key is present [cite: 32]
        // Keys: fibonacci, prime, lcm, hcf, AI
        
        if (body.fibonacci !== undefined) {
            // Input: Integer -> Output: Fib Series
            const n = parseInt(body.fibonacci);
            if (isNaN(n)) throw new Error("Invalid input for fibonacci");
            responseData = getFibonacci(n);

        } else if (body.prime) {
            // Input: Int Array -> Output: Primes
            if (!Array.isArray(body.prime)) throw new Error("Input must be an array");
            responseData = body.prime.filter(num => Number.isInteger(num) && isPrime(num));

        } else if (body.lcm) {
            // Input: Int Array -> Output: LCM Value
            if (!Array.isArray(body.lcm) || body.lcm.length === 0) throw new Error("Input must be a non-empty array");
            // Calculate LCM of array
            let result = body.lcm[0];
            for (let i = 1; i < body.lcm.length; i++) {
                result = lcm(result, body.lcm[i]);
            }
            responseData = result;

        } else if (body.hcf) {
            // Input: Int Array -> Output: HCF Value
            if (!Array.isArray(body.hcf) || body.hcf.length === 0) throw new Error("Input must be a non-empty array");
            // Calculate HCF (GCD) of array
            let result = body.hcf[0];
            for (let i = 1; i < body.hcf.length; i++) {
                result = gcd(result, body.hcf[i]);
            }
            responseData = result;

        } else if (body.AI) {
            // Input: Question string -> Output: Single-word AI response
            const prompt = `Answer this question in exactly one single word: ${body.AI}`;
            
            // Check if API key exists, else return mock to prevent crash
            if (!process.env.GEMINI_API_KEY) {
                responseData = "Configuration_Error_(Missing_API_Key)";
            } else {
                const model = genAI.getGenerativeModel({ model: "gemini-pro"});
                const result = await model.generateContent(prompt);
                const response = await result.response;
                responseData = response.text().trim().split(' ')[0]; // Ensure single word
            }
        } else {
             return res.status(400).json({
                "is_success": false,
                "official_email": OFFICIAL_EMAIL,
                "message": "Invalid Request. Key must be one of: fibonacci, prime, lcm, hcf, AI"
            });
        }

        // Success Response [cite: 35-41]
        res.status(200).json({
            "is_success": true,
            "official_email": OFFICIAL_EMAIL,
            "data": responseData
        });

    } catch (error) {
        // Graceful error handling [cite: 12]
        console.error(error);
        res.status(400).json({
            "is_success": false,
            "official_email": OFFICIAL_EMAIL,
            "message": "Exception occurred"
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
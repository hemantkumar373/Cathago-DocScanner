const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcryptjs");
const db = require("./database.js");
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(bodyParser.json());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, "uploads");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "text/plain") {
            cb(null, true);
        } else {
            cb(new Error("Only .txt files are allowed"), false);
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});


// Updated CORS configuration
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Added PUT and DELETE
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Handle OPTIONS requests
app.options('*', (req, res) => {
    res.sendStatus(200);
});

// User Registration (With Hashed Passwords & Admin Approval)
app.post("/auth/register", async (req, res) => {
    console.log("Received registration request");
    console.log("Request body:", req.body);

    const { username, email, password, role } = req.body;
    if (!username || !email || !password || !role) {
        return res.status(400).json({ error: "All fields are required" });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Set approved status based on role
    // Users are auto-approved (1), admins need approval (0)
    const approved = role === "admin" ? 0 : 1;
    
    db.run(`INSERT INTO users (username, email, password, role, approved, credits) 
            VALUES (?, ?, ?, ?, ?, 20)`, 
        [username, email, hashedPassword, role, approved],
        function(err) {
            if (err) {
                console.error("Database error:", err.message);
                return res.status(400).json({ error: err.message });
            }
            
            // Return different response based on role
            if (role === "admin") {
                res.json({ 
                    message: "Registration successful. Admin approval pending.",
                    pendingApproval: true 
                });
            } else {
                res.json({ 
                    message: "Registration successful", 
                    credits: 20 
                });
            }
        }
    );
});
// User Login (With Password Verification)
app.post("/auth/login", async (req, res) => {
    console.log("Login request received:", req.body); // Debugging log
    
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }
    
    try {
        db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Internal server error" });
            }
            
            if (!user) {
                return res.status(401).json({ error: "Invalid email or password" });
            }
            
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ error: "Invalid email or password" });
            }
            
            // Check admin approval status
            if (user.role === "admin" && user.approved === 0) {
                return res.json({ pendingApproval: true });
            }
            
            // Successful login
            res.json({
                username: user.username,
                email: user.email,
                role: user.role,
                credits: user.credits
            });
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Auto-reset credits daily
setInterval(() => {
    db.run(`UPDATE users SET credits = 20`);
}, 86400000); // 24 hours

// Credit Request Handling
app.post("/credits/request", (req, res) => {
    const { email, credits, reason } = req.body;
    
    db.run(
        `INSERT INTO credit_requests (user_email, credits, reason, status, request_date) 
         VALUES (?, ?, ?, 'pending', CURRENT_TIMESTAMP)`,
        [email, credits, reason],
        function(err) {
            if (err) {
                console.error("Error submitting credit request:", err);
                return res.status(400).json({ error: err.message });
            }
            res.json({ message: "Credit request submitted successfully" });
        }
    );
});

// Get user's credit requests
app.get("/credits/requests/:email", (req, res) => {
    const { email } = req.params;
    
    db.all(
        `SELECT * FROM credit_requests 
         WHERE user_email = ? 
         ORDER BY request_date DESC`,
        [email],
        (err, requests) => {
            if (err) {
                console.error("Error fetching credit requests:", err);
                return res.status(500).json({ error: err.message });
            }
            res.json(requests);
        }
    );
});

// Credit Approval (Admin Only)

app.post("/admin/credits/approve", (req, res) => {
    const { requestId, action, approvedAmount, rejectionReason } = req.body;
    
    db.serialize(() => {
        db.run(`UPDATE credit_requests SET 
            status = ?,
            approved_credits = ?,
            rejection_reason = ?
            WHERE id = ?`,
            [action, 
             action === 'approved' ? approvedAmount : null,
             action === 'rejected' ? rejectionReason : null,
             requestId],
        function(err) {
            if (err) return res.status(400).json({ error: err.message });
            
            if (action === "approved") {
                db.get(`SELECT user_email FROM credit_requests WHERE id = ?`, [requestId],
                    (err, request) => {
                        db.run(`UPDATE users SET credits = credits + ? WHERE email = ?`,
                            [approvedAmount, request.user_email]
                        );
                    }
                );
            }
            res.json({ message: `Request ${action} successfully` });
        });
    });
});

// Get all credit requests (Admin Only)
app.get("/admin/credits/pending", (req, res) => {
    db.all(
        `SELECT cr.*, u.username 
         FROM credit_requests cr
         LEFT JOIN users u ON cr.user_email = u.email 
         ORDER BY cr.request_date DESC`,
        [],
        (err, requests) => {
            if (err) {
                console.error("Error fetching credit requests:", err);
                return res.status(500).json({ error: err.message });
            }
            res.json(requests);
        }
    );
});

app.post("/assignment/scan", upload.single("document"), (req, res) => {
    const { email } = req.body;

    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path; // Get file path
    const fileName = req.file.originalname; // Get file name

    // Read the file content
    let fileContent;
    try {
        fileContent = fs.readFileSync(filePath, "utf-8"); // Read from disk
    } catch (error) {
        return res.status(500).json({ error: "Error reading file" });
    }

    db.get("SELECT credits FROM users WHERE email = ?", [email], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        if (user.credits < 1) {
            return res.status(400).json({ error: "Insufficient credits" });
        }

        db.run(
            "INSERT INTO documents (user_email, file_name, content) VALUES (?, ?, ?)",
            [email, fileName, fileContent],
            async function (err) {
                if (err) {
                    return res.status(500).json({ error: "Failed to save document" });
                }
                
                const documentId = this.lastID;

                // Deduct credit
                db.run("UPDATE users SET credits = credits - 1 WHERE email = ?", [email]);

                // Get existing documents
                db.all("SELECT id, content FROM documents WHERE user_email = ? AND id != ?", 
                    [email, documentId], async (err, documents) => {
                        
                        const matches = [];
                        for (const doc of documents) {
                            const similarityResult = await findSimilarContentWithGemini(fileContent, doc.content);
                            
                            if (similarityResult.similarityPercentage >= 30) {
                                let [id1, id2] = [documentId, doc.id].sort((a,b) => a-b);
                                db.run(
                                    `INSERT OR IGNORE INTO document_similarity 
                                    (document_id1, document_id2, similarity_percentage, matching_passages)
                                    VALUES (?, ?, ?, ?)`,

                                    [id1, id2, similarityResult.similarityPercentage, 
                                     JSON.stringify(similarityResult.matchingPassages)]
                                );
                                
                                matches.push({
                                    documentId: doc.id,
                                    fileName: doc.file_name,
                                    percentage: similarityResult.similarityPercentage,
                                    matchingPassages: similarityResult.matchingPassages
                                });
                            }
                        }

                        res.json({
                            message: "Document scanned successfully",
                            documentId,
                            fileName,
                            matches: matches.sort((a, b) => b.percentage - a.percentage),
                            remainingCredits: user.credits - 1
                        });
                    }
                );
            }
        );
    });
});

function findMatchingPassages(text1, text2) {
    const passages = [];
    const minPassageLength = 20; // Minimum characters for a passage to be considered
    
    // Normalize texts
    const normalize = text => text.toLowerCase().replace(/\s+/g, ' ').trim();
    const normalized1 = normalize(text1);
    const normalized2 = normalize(text2);
    
    // Split into sentences
    const sentences1 = normalized1.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentences2 = normalized2.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // First check for exact sentence matches
    sentences1.forEach(sentence1 => {
        if (sentence1.length < minPassageLength) return;
        
        sentences2.forEach(sentence2 => {
            if (sentence1 === sentence2 && !passages.includes(sentence1)) {
                passages.push(sentence1);
            }
        });
    });
    
    // If no exact sentences match, try to find substring matches
    if (passages.length === 0) {
        // Check for common substrings
        for (let i = 0; i < normalized1.length - minPassageLength; i++) {
            for (let length = minPassageLength; length <= 100 && i + length <= normalized1.length; length++) {
                const substring = normalized1.substring(i, i + length);
                if (normalized2.includes(substring) && !passages.includes(substring)) {
                    passages.push(substring);
                    // Skip ahead to avoid overlapping matches
                    i += length - 1;
                    break;
                }
            }
            
            // Limit to a reasonable number of passages
            if (passages.length >= 5) break;
        }
    }
    
    return passages.map(passage => {
        // Get the original casing for matched passages
        const regex = new RegExp(passage.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        const match1 = text1.match(regex);
        const match2 = text2.match(regex);
        
        // Return the best match with original casing
        return (match1 && match1[0]) || (match2 && match2[0]) || passage;
    });
}

// Function to extract common topics
function extractCommonTopics(text1, text2) {
    // Simple topic extraction based on word frequency
    const stopWords = new Set([
        'the', 'and', 'a', 'to', 'of', 'in', 'that', 'is', 'it', 'for', 'with',
        'on', 'as', 'an', 'by', 'at', 'from', 'be', 'was', 'this', 'are', 'or',
        'have', 'had', 'has', 'not', 'but', 'what', 'all', 'were', 'when', 'we',
        'they', 'there', 'their', 'you', 'your', 'can', 'will', 'who', 'how',
    ]);
    
    // Extract potential keywords from both texts
    const extract = (text) => {
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 3 && !stopWords.has(word));
        
        // Count word frequency
        const wordCount = {};
        words.forEach(word => {
            wordCount[word] = (wordCount[word] || 0) + 1;
        });
        
        // Get top words
        return Object.entries(wordCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20)
            .map(entry => entry[0]);
    };
    
    const keywords1 = extract(text1);
    const keywords2 = extract(text2);
    
    // Find common keywords between both texts
    const commonKeywords = keywords1.filter(keyword => keywords2.includes(keyword));
    
    // Group related keywords into topics
    const topics = [];
    const usedKeywords = new Set();
    
    for (const keyword of commonKeywords) {
        if (usedKeywords.has(keyword)) continue;
        
        // Look for related keywords
        const related = commonKeywords.filter(k => 
            k !== keyword && 
            !usedKeywords.has(k) && 
            (k.includes(keyword) || keyword.includes(k)));
        
        // Add to topics
        if (related.length > 0) {
            const topicKeywords = [keyword, ...related].slice(0, 3);
            topicKeywords.forEach(k => usedKeywords.add(k));
            topics.push(`${topicKeywords.join(', ')}`);
        } else {
            usedKeywords.add(keyword);
            topics.push(keyword);
        }
        
        // Limit to 5 topics
        if (topics.length >= 5) break;
    }
    
    return topics.length > 0 ? topics : ["Similar content structure"];
}

// Update your document scan route to include a better generateHighlightedContent function
function generateHighlightedContent(originalContent, matchingPassages) {
    if (!matchingPassages || matchingPassages.length === 0) {
        return originalContent;
    }
    
    // Create a copy of the content so we don't modify the original
    let highlightedContent = originalContent;
    
    // Sort passages by length (longest first) to avoid highlighting issues
    const sortedPassages = [...matchingPassages].sort((a, b) => b.length - a.length);
    
    // We'll track positions we've already highlighted to avoid overlaps
    const highlightedPositions = [];
    
    for (const passage of sortedPassages) {
        if (!passage || passage.length < 10) continue;
        
        // Escape special regex characters
        const escapedPassage = passage.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Find all occurrences of this passage
        const regex = new RegExp(escapedPassage, 'gi');
        let match;
        
        // We'll replace each occurrence that doesn't overlap with already highlighted text
        let lastIndex = 0;
        const segments = [];
        
        while ((match = regex.exec(highlightedContent)) !== null) {
            const start = match.index;
            const end = start + match[0].length;
            
            // Check if this match overlaps with any highlighted positions
            const overlaps = highlightedPositions.some(pos => 
                (start >= pos.start && start < pos.end) ||
                (end > pos.start && end <= pos.end) ||
                (start <= pos.start && end >= pos.end)
            );
            
            if (!overlaps) {
                // Add this segment to be highlighted
                segments.push({
                    text: match[0],
                    start: start,
                    end: end
                });
                
                // Track this position
                highlightedPositions.push({ start, end });
            }
        }
        
        // Apply highlights in reverse order to avoid position changes
        for (let i = segments.length - 1; i >= 0; i--) {
            const segment = segments[i];
            const before = highlightedContent.substring(0, segment.start);
            const after = highlightedContent.substring(segment.end);
            highlightedContent = before + 
                `<span style="background-color: #FFCCCC;">${segment.text}</span>` + 
                after;
        }
    }
    
    return highlightedContent;
}
// Get document history endpoint

app.get("/assignment/documents/:email", (req, res) => {
    const { email } = req.params;
    
    db.all(
        `SELECT d.id, d.file_name, d.scan_date,
         (SELECT COUNT(*) FROM documents d2 
          WHERE calculateSimilarity(d.content, d2.content) > 30
          AND d2.id != d.id) as match_count
         FROM documents d 
         WHERE d.user_email = ? 
         ORDER BY d.scan_date DESC`,
        [email],
        (err, documents) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(documents);
        }
    );
});


// Get document history
app.get("/assignment/history/:email", (req, res) => {
    const { email } = req.params;
    
    db.all(
        `SELECT d.id as documentId, d.file_name as fileName, d.scan_date as scanDate,
        (SELECT COUNT(*) FROM documents WHERE user_email = ? AND id != d.id) as match_count
        FROM documents d
        WHERE d.user_email = ?
        ORDER BY d.scan_date DESC`,
        [email, email],
        (err, documents) => {
            if (err) {
                return res.status(500).json({ error: "Database error" });
            }
            
            res.json(documents);
        }
    );
});
// View document content endpoint
app.get("/assignment/document/:id", (req, res) => {
    const { id } = req.params;
    const { email } = req.query;
    
    db.get("SELECT * FROM documents WHERE id = ? AND user_email = ?", [id, email], (err, document) => {
        db.all(
            `SELECT d.id, d.file_name, ds.similarity_percentage, ds.matching_passages 
             FROM document_similarity ds
             JOIN documents d ON d.id IN (ds.document_id1, ds.document_id2)
             WHERE (ds.document_id1 = ? OR ds.document_id2 = ?) 
               AND d.id != ?`,
            [id, id, id],
            (err, rows) => {
                res.json({
                    ...document,
                    matches: rows.map(row => ({
                        documentId: row.id,
                        fileName: row.file_name,
                        percentage: row.similarity_percentage,
                        matchingPassages: JSON.parse(row.matching_passages)
                    }))
                });
            }
        );
    });
});
// User credit management routes
app.get("/credits/balance/:email", (req, res) => {
    const { email } = req.params;
    
    db.get("SELECT credits FROM users WHERE email = ?", [email], (err, user) => {
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        
        res.json({ credits: user.credits });
    });
});

// Simple text similarity function
// function calculateSimilarity(text1, text2) {
//     // Convert texts to lowercase and split into words
//     const words1 = text1.toLowerCase().split(/\W+/);
//     const words2 = text2.toLowerCase().split(/\W+/);
    
//     // Create sets of unique words
//     const set1 = new Set(words1);
//     const set2 = new Set(words2);
    
//     // Calculate Jaccard similarity
//     const intersection = new Set([...set1].filter(x => set2.has(x)));
//     const union = new Set([...set1, ...set2]);
    
//     // Return similarity percentage
//     return (intersection.size / union.size) * 100;
// }
function calculateSimilarity(text1, text2) {
    // Simple similarity calculation based on character matching
    const maxLength = Math.max(text1.length, text2.length);
    if (maxLength === 0) return 100; // Both empty strings are identical
    
    let matches = 0;
    const minLength = Math.min(text1.length, text2.length);
    
    for (let i = 0; i < minLength; i++) {
        if (text1[i] === text2[i]) {
            matches++;
        }
    }
    
    return Math.round((matches / maxLength) * 100);
}

async function findSimilarContentWithGemini(newContent, existingContent) {
    try {
        // If you have the Gemini API, keep your existing implementation
        // If not, use this simplified version
        
        // Calculate basic similarity score
        const similarityScore = calculateBasicSimilarity(newContent, existingContent);
        
        // Find common phrases (at least 20 characters long)
        const matchingPassages = findMatchingPassages(newContent, existingContent);
        
        // Extract potential topics from both documents
        const commonTopics = extractCommonTopics(newContent, existingContent);
        
        return {
            similarityPercentage: similarityScore,
            commonTopics: commonTopics,
            matchingPassages: matchingPassages
        };
    } catch (error) {
        console.error("Error in similarity calculation:", error);
        
        // Fallback to very basic calculation
        return {
            similarityPercentage: calculateBasicSimilarity(newContent, existingContent),
            commonTopics: ["Content similarity analyzed with basic algorithm"],
            matchingPassages: []
        };
    }
}

// Helper function to calculate basic similarity
function calculateBasicSimilarity(text1, text2) {
    // Convert to lowercase and remove punctuation for better comparison
    const normalize = text => text.toLowerCase().replace(/[^\w\s]/g, '');
    
    const normalized1 = normalize(text1);
    const normalized2 = normalize(text2);
    
    // Split into words
    const words1 = normalized1.split(/\s+/).filter(word => word.length > 2);
    const words2 = normalized2.split(/\s+/).filter(word => word.length > 2);
    
    // Count matching words
    const wordSet1 = new Set(words1);
    const wordSet2 = new Set(words2);
    
    let matchCount = 0;
    wordSet1.forEach(word => {
        if (wordSet2.has(word)) {
            matchCount++;
        }
    });
    
    // Calculate Jaccard similarity
    const union = new Set([...wordSet1, ...wordSet2]).size;
    const jaccardSimilarity = union === 0 ? 0 : (matchCount / union) * 100;
    
    return Math.round(jaccardSimilarity);
}
function generateHighlightedContent(originalContent, matchingPassages) {
    let highlightedContent = originalContent;
    
    // Replace matching passages with highlighted versions
    if (matchingPassages && matchingPassages.length > 0) {
        for (const passage of matchingPassages) {
            // Escape special regex characters in the passage
            const escapedPassage = passage.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escapedPassage, 'g');
            highlightedContent = highlightedContent.replace(regex, `<span style="background-color: #FFCCCC;">${passage}</span>`);
        }
    }
    
    return highlightedContent;
}



// Dashboard statistics endpoint
app.get("/admin/dashboard/stats", (req, res) => {
    db.serialize(() => {
        // Get total users count
        db.get("SELECT COUNT(*) as totalUsers FROM users WHERE role = 'user'", [], (err, userResult) => {
            if (err) return res.status(500).json({ error: err.message });
            
            // Get total documents count
            db.get("SELECT COUNT(*) as totalDocuments FROM documents", [], (err, docResult) => {
                if (err) return res.status(500).json({ error: err.message });
                
                // Get pending credit requests count
                db.get("SELECT COUNT(*) as pendingRequests FROM credit_requests WHERE status = 'pending'", [], (err, reqResult) => {
                    if (err) return res.status(500).json({ error: err.message });
                    
                    // Get total admins count
                    db.get("SELECT COUNT(*) as totalAdmins FROM users WHERE role = 'admin' AND approved = 1", [], (err, adminResult) => {
                        if (err) return res.status(500).json({ error: err.message });
                        
                        // Return all stats
                        res.json({
                            totalUsers: userResult.totalUsers,
                            totalDocuments: docResult.totalDocuments,
                            pendingRequests: reqResult.pendingRequests,
                            totalAdmins: adminResult.totalAdmins
                        });
                    });
                });
            });
        });
    });
});

// Dashboard recent activity endpoint
app.get("/admin/dashboard/activity", (req, res) => {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    db.serialize(() => {
        // Combine activities from different tables for today
        const activities = [];
        
        // Get document scans from today
        db.all(
            `SELECT d.user_email, u.username, 'Document Scan' as action, 
             d.file_name as details, d.scan_date as timestamp
             FROM documents d
             LEFT JOIN users u ON d.user_email = u.email
             WHERE DATE(d.scan_date) = ?
             ORDER BY d.scan_date DESC
             LIMIT 10`,
            [today],
            (err, docScans) => {
                if (err) {
                    console.error("Error fetching document scans:", err);
                } else {
                    activities.push(...docScans);
                }
                
                // Get credit requests from today
                db.all(
                    `SELECT cr.user_email, u.username, 'Credit Request' as action, 
                     (cr.credits || ' credits') as details, cr.request_date as timestamp
                     FROM credit_requests cr
                     LEFT JOIN users u ON cr.user_email = u.email
                     WHERE DATE(cr.request_date) = ?
                     ORDER BY cr.request_date DESC
                     LIMIT 10`,
                    [today],
                    (err, creditRequests) => {
                        if (err) {
                            console.error("Error fetching credit requests:", err);
                        } else {
                            activities.push(...creditRequests);
                        }
                        
                        // Sort combined activities by timestamp, most recent first
                        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                        
                        // Return the most recent 10 activities
                        res.json(activities.slice(0, 10));
                    }
                );
            }
        );
    });
});
// Get all users
// 
// Version without ORDER BY if created_at doesn't exist
app.get("/admin/users", (req, res) => {
    db.all(`SELECT id, username, email, role, credits, approved, 
            CASE 
                WHEN approved = 1 THEN 'active'
                ELSE 'inactive'
            END as status
            FROM users
            WHERE role = 'user'`, [], (err, users) => {
        if (err) {
            console.error("Error fetching users:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json(users);
    });
});
// Add new user
// Update the user creation endpoint in your Express backend
app.post("/admin/users", async (req, res) => {
    console.log("Received user creation request:", req.body); // Add logging

    const { username, email, password, credits, role } = req.body;
    
    // Validate required fields
    if (!username || !username.trim()) {
        return res.status(400).json({ error: "Username is required" });
    }
    if (!email || !email.trim()) {
        return res.status(400).json({ error: "Email is required" });
    }
    if (!password) {
        return res.status(400).json({ error: "Password is required for new users" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const sql = `
            INSERT INTO users (username, email, password, credits, role, approved)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const params = [
            username.trim(),
            email.trim(),
            hashedPassword,
            credits || 20,
            role || 'user',
            1
        ];

        console.log("Executing SQL:", sql, "with params:", params); // Add logging

        db.run(sql, params, function(err) {
            if (err) {
                console.error('Database error:', err); // Add logging
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: "Username or email already exists" });
                }
                return res.status(500).json({ error: "Failed to create user" });
            }
            
            res.json({ 
                id: this.lastID,
                message: "User created successfully" 
            });
        });
    } catch (err) {
        console.error('Error creating user:', err); // Add logging
        res.status(500).json({ error: "Internal server error" });
    }
});

// Update user
app.put("/admin/users/:id", async (req, res) => {
    const { username, email, password, credits, role } = req.body;
    const userId = req.params.id;

    try {
        let updateQuery = `UPDATE users SET 
            username = ?, 
            email = ?,
            credits = ?,
            role = ?`;
        let params = [username, email, credits, role];

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateQuery += `, password = ?`;
            params.push(hashedPassword);
        }

        updateQuery += ` WHERE id = ?`;
        params.push(userId);

        db.run(updateQuery, params, function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: "Username or email already exists" });
                }
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: "User not found" });
            }
            res.json({ message: "User updated successfully" });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete user
app.delete("/admin/users/:id", (req, res) => {
    const userId = req.params.id;
    
    db.run(`DELETE FROM users WHERE id = ?`, [userId], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({ message: "User deleted successfully" });
    });
});

// Toggle user status
app.post("/admin/users/:id/toggle-status", (req, res) => {
    const userId = req.params.id;
    
    db.run(`UPDATE users SET approved = CASE WHEN approved = 1 THEN 0 ELSE 1 END 
            WHERE id = ?`, [userId], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({ message: "User status toggled successfully" });
    });
});
// Get single user
app.get("/admin/users/:id", (req, res) => {
    const userId = req.params.id;
    
    db.get(`SELECT id, username, email, role, credits, approved FROM users WHERE id = ?`, 
        [userId], 
        (err, user) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            res.json(user);
        }
    );
});

// Get all admins (both pending and current)
app.get("/admin/admins", (req, res) => {
    db.serialize(() => {
        // Get pending admin requests
        const pendingAdmins = db.all(
            `SELECT id, username, email, created_at 
             FROM users 
             WHERE role = 'admin' AND approved = 0 
             ORDER BY created_at DESC`,
            [],
            (err, pendingResults) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                // Get current admins
                db.all(
                    `SELECT id, username, email, approved, created_at 
                     FROM users 
                     WHERE role = 'admin' AND approved != 0 
                     ORDER BY created_at DESC`,
                    [],
                    (err, currentResults) => {
                        if (err) {
                            return res.status(500).json({ error: err.message });
                        }
                        
                        res.json({
                            pendingAdmins: pendingResults || [],
                            currentAdmins: currentResults || []
                        });
                    }
                );
            }
        );
    });
});

// Approve admin request
app.post("/admin/approve/:id", (req, res) => {
    const adminId = req.params.id;
    
    db.run(
        `UPDATE users SET approved = 1 WHERE id = ? AND role = 'admin'`,
        [adminId],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: "Admin not found" });
            }
            res.json({ message: "Admin approved successfully" });
        }
    );
});

// Reject admin request
app.post("/admin/reject/:id", (req, res) => {
    const adminId = req.params.id;
    
    db.run(
        `DELETE FROM users WHERE id = ? AND role = 'admin' AND approved = 0`,
        [adminId],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: "Admin not found" });
            }
            res.json({ message: "Admin request rejected successfully" });
        }
    );
});

// Toggle admin status (activate/deactivate)
app.post("/admin/toggle-status/:id", (req, res) => {
    const adminId = req.params.id;
    
    db.run(
        `UPDATE users SET approved = CASE WHEN approved = 1 THEN 2 ELSE 1 END 
         WHERE id = ? AND role = 'admin'`,
        [adminId],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: "Admin not found" });
            }
            res.json({ message: "Admin status updated successfully" });
        }
    );
});

// Remove admin
app.delete("/admin/remove/:id", (req, res) => {
    const adminId = req.params.id;
    
    db.run(
        `DELETE FROM users WHERE id = ? AND role = 'admin'`,
        [adminId],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: "Admin not found" });
            }
            res.json({ message: "Admin removed successfully" });
        }
    );
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
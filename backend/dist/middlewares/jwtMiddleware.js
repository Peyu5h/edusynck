import jwt from "jsonwebtoken";
const SECRET_KEY = process.env.JWT_SECRET;
export const jwtMiddleware = (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "No token provided" });
    }
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: "Invalid token" });
        }
        req["user"] = decoded;
        next();
    });
};

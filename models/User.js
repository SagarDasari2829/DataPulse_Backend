const crypto = require("crypto");
const mongoose = require("mongoose");

const PASSWORD_ITERATIONS = 100000;
const PASSWORD_KEY_LENGTH = 64;
const PASSWORD_DIGEST = "sha512";

const hashPassword = (password, salt) =>
  crypto
    .pbkdf2Sync(password, salt, PASSWORD_ITERATIONS, PASSWORD_KEY_LENGTH, PASSWORD_DIGEST)
    .toString("hex");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.setPassword = function setPassword(plainPassword) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hashedPassword = hashPassword(plainPassword, salt);
  this.password = `${salt}:${hashedPassword}`;
};

userSchema.methods.comparePassword = function comparePassword(plainPassword) {
  if (!this.password || !this.password.includes(":")) {
    return false;
  }

  const [salt, storedHash] = this.password.split(":");
  const calculatedHash = hashPassword(plainPassword, salt);
  const storedBuffer = Buffer.from(storedHash, "hex");
  const calculatedBuffer = Buffer.from(calculatedHash, "hex");

  if (storedBuffer.length !== calculatedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(storedBuffer, calculatedBuffer);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model("User", userSchema);

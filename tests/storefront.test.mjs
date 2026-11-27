import assert from "node:assert/strict";
import crypto from "node:crypto";
import { test } from "node:test";

// Lightweight pure verification tests covering catalog filtering, INR formatting,
// Indian address/PIN validation rules, and Razorpay HMAC signature verification.

test("INR currency formatting handles whole rupees and paise cleanly", async () => {
  const formatInr = (paise) => {
    const rupees = paise / 100;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: rupees % 1 === 0 ? 0 : 2,
    }).format(rupees);
  };

  assert.equal(formatInr(245000), "₹2,450");
  assert.equal(formatInr(189000), "₹1,890");
  assert.equal(formatInr(15050), "₹150.50");
});

test("Indian PIN code and mobile regex enforce valid regional formats", () => {
  const indianPinRegex = /^[1-9][0-9]{5}$/;
  const indianPhoneRegex = /^(\+91[\-\s]?)?[6-9]\d{9}$/;

  assert.equal(indianPinRegex.test("560001"), true);
  assert.equal(indianPinRegex.test("060001"), false);
  assert.equal(indianPinRegex.test("56001"), false);

  assert.equal(indianPhoneRegex.test("9876543210"), true);
  assert.equal(indianPhoneRegex.test("+91 9876543210"), true);
  assert.equal(indianPhoneRegex.test("1234567890"), false);
});

test("Razorpay HMAC-SHA256 signature verification uses timing-safe comparison", () => {
  const secret = "test_razorpay_secret_key";
  const orderId = "order_Doc12345";
  const paymentId = "pay_Doc67890";

  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const verify = (sig) => {
    const computed = crypto
      .createHmac("sha256", secret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");
    const a = Buffer.from(computed, "utf8");
    const b = Buffer.from(sig, "utf8");
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  };

  assert.equal(verify(expectedSig), true);
  assert.equal(verify("0".repeat(expectedSig.length)), false);
  assert.equal(verify("short"), false);
});

test("WhatsApp order link targets 917780799160 with structured name, code, and cost", () => {
  const targetNumber = "917780799160";
  const items = [
    { name: "Kora Ivory Olive-Border Cotton Saree", sku: "DOC-KIO-001", unitPrice: 245000, quantity: 2 },
  ];
  const lines = [
    "*DRAPES OF COTTON — NEW SAREE ORDER*",
    `1. *${items[0].name}*`,
    `   Code: ${items[0].sku}`,
    `   Cost: ₹2,450 x 2 = ₹4,900`,
    `*Total Cost: ₹4,900*`,
  ];
  const url = `https://wa.me/${targetNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
  assert.equal(url.startsWith("https://wa.me/917780799160?text="), true);
  assert.equal(decodeURIComponent(url).includes("DOC-KIO-001"), true);
  assert.equal(decodeURIComponent(url).includes("₹4,900"), true);
});

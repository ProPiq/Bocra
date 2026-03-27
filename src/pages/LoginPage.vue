<template>
  <div class="login-page">
    <div class="login-card">
      <div class="form-pane">
        <div class="left-panel">
          <a class="portal-brand" href="#/" aria-label="BOCRA home">
            <img src="/img/logo-transparent.png" alt="BOCRA" />
            <span>Public Portal</span>
          </a>

          <div v-if="mode !== 'verify'" class="auth-content">
            <h1 v-if="isSignUp">Create<br />Account</h1>
            <h1 v-else>Welcome<br />Back</h1>
            <p class="subtitle">{{ subtitle }}</p>

            <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

            <input
              v-if="isSignUp"
              v-model="form.fullName"
              class="input"
              placeholder="Full Name"
              @input="clearError"
            />
            <input
              v-model="form.email"
              class="input"
              placeholder="Email"
              @input="clearError"
            />
            <input
              v-if="isSignUp"
              v-model="form.phoneNumber"
              class="input"
              placeholder="Phone Number"
              @input="clearError"
            />
            <input
              v-model="form.password"
              class="input"
              type="password"
              placeholder="Password"
              @input="clearError"
            />
            <input
              v-if="isSignUp"
              v-model="form.confirmPassword"
              class="input"
              type="password"
              placeholder="Confirm Password"
              @input="clearError"
            />

            <select
              v-if="isSignUp"
              v-model="form.userType"
              class="input"
              @change="clearError"
            >
              <option value="individual">Individual</option>
              <option value="organization">Organization</option>
            </select>

            <div v-if="showOrganizationFields" class="org-section">
              <input
                v-model="form.orgName"
                class="input"
                placeholder="Organization Name"
                @input="clearError"
              />
              <input
                v-model="form.regNumber"
                class="input"
                placeholder="Registration Number"
                @input="clearError"
              />
              <select v-model="form.orgType" class="input" @change="clearError">
                <option value="company">Company</option>
                <option value="government">Government</option>
                <option value="ngo">NGO</option>
                <option value="individual">Individual</option>
                <option value="other">Other</option>
              </select>
              <input
                v-model="form.taxId"
                class="input"
                placeholder="Tax Identifier"
                @input="clearError"
              />
              <input
                v-model="form.orgEmail"
                class="input"
                placeholder="Contact Email"
                @input="clearError"
              />
              <input
                v-model="form.orgPhone"
                class="input"
                placeholder="Contact Phone"
                @input="clearError"
              />
              <textarea
                v-model="form.orgAddress"
                class="input"
                placeholder="Address"
                @input="clearError"
              ></textarea>
            </div>

            <div v-if="!isSignUp" class="meta-row">
              <label><input v-model="rememberMe" type="checkbox" /> Remember me</label>
              <span>Forgot Password?</span>
            </div>

            <button class="btn" type="button" :disabled="isSubmitting" @click="handleSubmit">
              {{ isSubmitting ? "Please wait..." : buttonLabel }}
            </button>

            <div class="bottom">
              <template v-if="isSignUp">
                Already have an account?
                <span @click="switchToLogin">Sign In</span>
              </template>
              <template v-else>
                Don't have an account?
                <span @click="startSignUp">Sign Up</span>
              </template>
            </div>
          </div>

          <div v-else class="verify-only">
            <h1>Verify Email</h1>
            <p class="subtitle">
              We've sent a verification code to your email address.
            </p>

            <div class="otp-inputs">
              <input
                v-for="(digit, index) in otpDigits"
                :key="index"
                :value="digit"
                class="otp"
                maxlength="1"
                @input="updateOtp(index, $event)"
              />
            </div>

            <button class="btn" type="button" @click="submitOtp">Submit</button>

            <p class="verify-copy">
              Didn't receive a code?
              <span @click="resendCode">Resend code</span>
            </p>
          </div>
        </div>
      </div>

      <div class="visual-pane">
        <img src="/img/slider-1.jpg" class="bg-img" alt="BOCRA background" />
        <div class="overlay"></div>
        <div class="bocra">
          <div class="brand-panel">
            <img src="/img/logo-transparent.png" class="brand-logo" alt="BOCRA" />
            <p>Access licensing, compliance, and digital regulatory services in one place.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { persistAuthSession, resolveApiUrl } from "../lib/platformApi";

const REGISTER_ENDPOINT = resolveApiUrl("/auth/register");
const LOGIN_ENDPOINT = resolveApiUrl("/auth/login");

const route = useRoute();
const router = useRouter();
const mode = ref("signin");
const isSubmitting = ref(false);
const rememberMe = ref(true);
const errorMessage = ref("");
const otpDigits = ref(["", "", "", "", "", ""]);

const form = reactive({
  fullName: "",
  email: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
  userType: "individual",
  orgName: "",
  regNumber: "",
  orgType: "company",
  taxId: "",
  orgEmail: "",
  orgPhone: "",
  orgAddress: "",
});

const isSignUp = computed(() => mode.value === "signup");
const showOrganizationFields = computed(
  () => isSignUp.value && form.userType === "organization",
);
const subtitle = computed(() =>
  isSignUp.value
    ? "Create your BOCRA portal account to get started."
    : "Sign in to manage your applications and services.",
);
const buttonLabel = computed(() => (isSignUp.value ? "Register" : "Sign In"));
const redirectPath = computed(() =>
  typeof route.query.redirect === "string" && route.query.redirect.startsWith("/")
    ? route.query.redirect
    : "/dashboard",
);

function clearError() {
  errorMessage.value = "";
}

function resolveErrorMessage(data, fallbackMessage) {
  if (!data) {
    return fallbackMessage;
  }

  if (typeof data.message === "string" && data.message.trim()) {
    return data.message;
  }

  if (typeof data.detail === "string" && data.detail.trim()) {
    return data.detail;
  }

  if (Array.isArray(data.detail) && data.detail.length && typeof data.detail[0]?.msg === "string") {
    return data.detail[0].msg;
  }

  return fallbackMessage;
}

function startSignUp() {
  clearError();
  mode.value = "signup";
}

function switchToLogin() {
  clearError();
  mode.value = "signin";
}

function sanitizePhone(value) {
  return value.replace(/\D/g, "");
}

function updateOtp(index, event) {
  const value = event.target.value.replace(/\D/g, "").slice(0, 1);
  otpDigits.value[index] = value;
}

async function handleSubmit() {
  clearError();

  if (!form.email.trim() || !form.password) {
    errorMessage.value = "Please enter email and password.";
    return;
  }

  if (isSignUp.value) {
    if (!form.fullName.trim()) {
      errorMessage.value = "Please enter your full name.";
      return;
    }

    if (form.password !== form.confirmPassword) {
      errorMessage.value = "Passwords do not match.";
      return;
    }
  }

  isSubmitting.value = true;

  try {
    if (isSignUp.value) {
      const payload = {
        email: form.email.trim(),
        phone_number: sanitizePhone(form.phoneNumber),
        full_name: form.fullName.trim(),
        password: form.password,
        user_type: form.userType,
        organization: null,
      };

      if (form.userType === "organization") {
        payload.organization = {
          name: form.orgName.trim(),
          registration_number: form.regNumber.trim(),
          organization_type: form.orgType,
          tax_identifier: form.taxId.trim(),
          contact_email: form.orgEmail.trim(),
          contact_phone: sanitizePhone(form.orgPhone),
          address: form.orgAddress.trim(),
        };
      }

      const response = await fetch(REGISTER_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        errorMessage.value = resolveErrorMessage(data, "Registration failed.");
        return;
      }

      mode.value = "verify";
      return;
    }

    const response = await fetch(LOGIN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email: form.email.trim(),
        password: form.password,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      errorMessage.value = resolveErrorMessage(data, "Login failed.");
      return;
    }

    if (data.requires_mfa) {
      errorMessage.value = "Multi-factor authentication is required for this account.";
      return;
    }

    if (!data.session?.access_token) {
      errorMessage.value = "Login response did not include a usable session.";
      return;
    }

    persistAuthSession(data);
    await router.push(redirectPath.value);
  } catch (error) {
    console.error(error);
    errorMessage.value = isSignUp.value
      ? "Network error during registration."
      : "Network error during login.";
  } finally {
    isSubmitting.value = false;
  }
}

function submitOtp() {
  window.alert("Verification complete");
}

function resendCode() {
  otpDigits.value = ["", "", "", "", "", ""];
  window.alert("Code resent");
}
</script>

<style scoped>
.login-page,
.login-page * {
  box-sizing: border-box;
  font-family: "Inter", sans-serif;
}

.login-page {
  background: linear-gradient(135deg, #eef4f2 0%, #f7f3ea 100%);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 32px 24px;
}

.login-page .login-card {
  width: 100%;
  max-width: 1100px;
  min-height: 650px;
  height: auto;
  background: #fff;
  border-radius: 28px;
  display: flex;
  overflow: hidden;
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.16);
}

.login-page .form-pane,
.login-page .visual-pane {
  flex: 1 1 50%;
  min-width: 0;
}

.login-page .form-pane {
  padding: 44px 52px;
  display: flex;
  justify-content: center;
  align-items: stretch;
}

.login-page .left-panel {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.login-page .portal-brand {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  width: fit-content;
  text-decoration: none;
}

.login-page .portal-brand img {
  width: min(100%, 250px);
  height: auto;
  display: block;
}

.login-page .portal-brand span {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #0f766e;
}

.login-page .auth-content {
  flex: 1 1 auto;
  overflow: visible;
  max-height: none;
  padding-right: 0;
  width: 100%;
}

.login-page .verify-only {
  flex: 1 1 auto;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-self: center;
}

.login-page h1 {
  font-size: 42px;
  font-weight: 600;
  line-height: 1.05;
  color: #334155;
  margin: 0;
}

.login-page .subtitle {
  color: #64748b;
  margin: 16px 0 30px;
  line-height: 1.6;
}

.login-page .input,
.login-page select,
.login-page textarea {
  width: 100%;
  padding: 14px;
  margin: 10px 0;
  border-radius: 12px;
  border: 1px solid #d7dfde;
  background: #fcfdfd;
  font-size: 16px;
  color: #0f172a;
}

.login-page .input:focus,
.login-page select:focus,
.login-page textarea:focus {
  outline: none;
  border-color: #0f766e;
  box-shadow: 0 0 0 4px rgba(15, 118, 110, 0.12);
}

.login-page .btn {
  margin-top: 25px;
  width: 180px;
  padding: 14px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #0f766e, #1b7f1d);
  color: #fff;
  cursor: pointer;
  font-weight: 700;
  box-shadow: 0 18px 30px rgba(15, 118, 110, 0.22);
}

.login-page .btn:disabled {
  cursor: wait;
  opacity: 0.7;
}

.login-page .meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #666;
  margin-top: 4px;
  margin-left: 0;
  margin-right: 0;
}

.login-page .bottom {
  margin-top: 40px;
  font-size: 14px;
  color: #777;
}

.login-page .bottom span,
.login-page .verify-copy span {
  color: #0f766e;
  cursor: pointer;
  text-decoration: underline;
}

.login-page .visual-pane {
  position: relative;
  overflow: hidden;
  background: #0f172a;
}

.login-page .bg-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.login-page .overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(155deg, rgba(7, 35, 52, 0.8), rgba(13, 121, 70, 0.58));
}

.login-page .bocra {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32px;
}

.login-page .brand-panel {
  max-width: 420px;
  padding: 28px 30px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.92);
  text-align: center;
  box-shadow: 0 24px 50px rgba(15, 23, 42, 0.18);
  backdrop-filter: blur(10px);
}

.login-page .brand-logo {
  width: min(100%, 320px);
  height: auto;
  display: block;
  margin: 0 auto;
}

.login-page .brand-panel p {
  margin: 18px 0 0;
  color: #334155;
  font-size: 17px;
  line-height: 1.6;
}

.login-page .org-section {
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #d7dfde;
  border-radius: 16px;
  background: #f8fbfb;
}

.login-page .error-message {
  color: #d32f2f;
  font-size: 14px;
  margin: 10px 0 20px;
  padding: 10px;
  background: #ffebee;
  border-radius: 6px;
  border-left: 4px solid #d32f2f;
}

.login-page .otp-inputs {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 20px 0;
}

.login-page .otp {
  width: 42px;
  height: 48px;
  font-size: 22px;
  text-align: center;
  border-radius: 10px;
  border: 1px solid #d7dfde;
}

.login-page .verify-copy {
  margin-top: 16px;
  font-size: 14px;
  color: #64748b;
}

@media (max-width: 900px) {
  .login-page .login-card {
    flex-direction: column;
    height: auto;
  }

  .login-page .form-pane,
  .login-page .visual-pane {
    flex-basis: auto;
    width: 100%;
  }

  .login-page .form-pane {
    padding: 32px 28px;
  }

  .login-page .visual-pane {
    min-height: 320px;
  }

  .login-page .auth-content {
    padding-right: 0;
  }

  .login-page .portal-brand img {
    width: min(100%, 220px);
  }
}

@media (max-width: 600px) {
  .login-page {
    padding: 16px;
  }

  .login-page .btn {
    width: 100%;
  }

  .login-page .meta-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .login-page .otp-inputs {
    gap: 6px;
  }

  .login-page .otp {
    width: 36px;
    height: 42px;
  }

  .login-page .brand-panel {
    padding: 24px 20px;
  }
}
</style>

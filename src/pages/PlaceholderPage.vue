<template>
  <ClientWorkspaceLayout>
    <div class="app-page workspace-page">
      <section class="app-panel app-page-hero">
        <div>
          <p class="app-eyebrow">{{ shell.badge }}</p>
          <h2>{{ route.meta.title }}</h2>
          <p>{{ shell.summary }}</p>
        </div>

        <span class="app-status-pill app-status-pill--info">{{ heroBadge }}</span>
      </section>

      <p v-if="loading" class="app-note">{{ loadingLabel }}</p>

      <template v-else>
        <p v-if="pageError" class="app-note app-note--error">{{ pageError }}</p>
        <p v-if="successMessage" class="workspace-page__success">{{ successMessage }}</p>

        <section class="app-meta-grid">
          <article v-for="metric in pageMetrics" :key="metric.label" class="app-stat-card">
            <p>{{ metric.label }}</p>
            <strong>{{ metric.value }}</strong>
            <span>{{ metric.caption }}</span>
          </article>
        </section>

        <template v-if="shellKey === 'type-approval'">
          <section class="workspace-page__grid workspace-page__grid--balanced">
            <article class="app-panel">
              <div class="app-section-head">
                <div>
                  <h3>Current API exposure</h3>
                  <p>
                    The public API currently exposes live type approval guidance, notices, fee
                    structure, and license categories. A dedicated applicant-side type approval
                    submission workflow is not exposed yet, so this page stays precise to the
                    capabilities that already exist.
                  </p>
                </div>
              </div>

              <ul class="app-list">
                <li>License categories and service lanes are pulled from the public catalogue.</li>
                <li>Guidelines and notices are available with direct download actions.</li>
                <li>Fee structure is grouped by category and license type for quick review.</li>
              </ul>
            </article>

            <article class="app-panel">
              <div class="app-section-head">
                <div>
                  <h3>License categories</h3>
                  <p>Browse the public category structure that sits behind BOCRA licensing services.</p>
                </div>
              </div>

              <div class="workspace-page__category-stack">
                <article
                  v-for="category in licenseCategories"
                  :key="category.id || category.code"
                  class="app-panel-muted"
                >
                  <strong>{{ category.name }}</strong>
                  <p>{{ category.description || "Category information available in the public catalogue." }}</p>
                  <span>
                    {{ category.license_types?.length || 0 }} licence type{{
                      (category.license_types?.length || 0) === 1 ? "" : "s"
                    }}
                  </span>
                </article>
              </div>
            </article>
          </section>

          <section class="workspace-page__grid workspace-page__grid--balanced">
            <article class="app-panel">
              <div class="app-section-head">
                <div>
                  <h3>Guidelines</h3>
                  <p>Published guidance relevant to preparation and submission.</p>
                </div>
              </div>

              <div class="app-table-wrap">
                <table v-if="paginatedGuidelines.items.length" class="app-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Audience</th>
                      <th>Updated</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="guideline in paginatedGuidelines.items" :key="guideline.code">
                      <td>{{ guideline.title }}</td>
                      <td>{{ guideline.audience || "Public" }}</td>
                      <td>{{ formatDate(guideline.updated_at) }}</td>
                      <td>
                        <a
                          class="workspace-page__link-button"
                          :href="guideline.download_url"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Download
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p v-else class="app-note">No public guidance is available right now.</p>
              </div>

              <div v-if="paginatedGuidelines.totalPages > 1" class="workspace-page__pagination">
                <button
                  class="app-button app-button--secondary"
                  type="button"
                  :disabled="paginatedGuidelines.page <= 1"
                  @click="setPage(guidelinePage, paginatedGuidelines.page - 1, paginatedGuidelines.totalPages)"
                >
                  Previous
                </button>
                <span>Page {{ paginatedGuidelines.page }} of {{ paginatedGuidelines.totalPages }}</span>
                <button
                  class="app-button app-button--secondary"
                  type="button"
                  :disabled="paginatedGuidelines.page >= paginatedGuidelines.totalPages"
                  @click="setPage(guidelinePage, paginatedGuidelines.page + 1, paginatedGuidelines.totalPages)"
                >
                  Next
                </button>
              </div>
            </article>

            <article class="app-panel">
              <div class="app-section-head">
                <div>
                  <h3>Notices</h3>
                  <p>Published notices and updates from the public BOCRA catalogue.</p>
                </div>
              </div>

              <div class="app-table-wrap">
                <table v-if="paginatedNotices.items.length" class="app-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Published</th>
                      <th>Updated</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="notice in paginatedNotices.items" :key="notice.code">
                      <td>{{ notice.title }}</td>
                      <td>{{ formatDateTime(notice.published_at) }}</td>
                      <td>{{ formatDate(notice.updated_at) }}</td>
                      <td>
                        <a
                          class="workspace-page__link-button"
                          :href="notice.download_url"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Download
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p v-else class="app-note">No notices are published at the moment.</p>
              </div>

              <div v-if="paginatedNotices.totalPages > 1" class="workspace-page__pagination">
                <button
                  class="app-button app-button--secondary"
                  type="button"
                  :disabled="paginatedNotices.page <= 1"
                  @click="setPage(noticePage, paginatedNotices.page - 1, paginatedNotices.totalPages)"
                >
                  Previous
                </button>
                <span>Page {{ paginatedNotices.page }} of {{ paginatedNotices.totalPages }}</span>
                <button
                  class="app-button app-button--secondary"
                  type="button"
                  :disabled="paginatedNotices.page >= paginatedNotices.totalPages"
                  @click="setPage(noticePage, paginatedNotices.page + 1, paginatedNotices.totalPages)"
                >
                  Next
                </button>
              </div>
            </article>
          </section>

          <section class="app-panel">
            <div class="app-section-head">
              <div>
                <h3>Fee structure</h3>
                <p>Public fee lines grouped by category and license type.</p>
              </div>
            </div>

            <div v-if="feeStructure.length" class="workspace-page__fee-grid">
              <article
                v-for="category in feeStructure"
                :key="category.license_category_code"
                class="workspace-page__fee-card app-panel-muted"
              >
                <strong>{{ category.license_category_name }}</strong>
                <div
                  v-for="licenseType in category.license_types"
                  :key="licenseType.license_type_code"
                  class="workspace-page__fee-block"
                >
                  <p>{{ licenseType.license_type_name }}</p>
                  <ul class="workspace-page__mini-list">
                    <li v-for="fee in licenseType.fees" :key="fee.fee_schedule_code">
                      <span>{{ fee.service_type_name }}</span>
                      <strong>{{ formatCurrency(fee.amount, fee.currency) }}</strong>
                    </li>
                  </ul>
                </div>
              </article>
            </div>
            <p v-else class="app-note">No fee structure entries are currently available.</p>
          </section>
        </template>

        <template v-else-if="shellKey === 'qos-monitoring'">
          <section class="workspace-page__grid workspace-page__grid--balanced">
            <article class="app-panel">
              <div class="app-section-head">
                <div>
                  <h3>QoS report editor</h3>
                  <p>
                    This lane uses the compliance submission API for
                    <code>quality_of_service_report</code> drafts and submissions.
                  </p>
                </div>

                <button
                  class="app-button app-button--secondary"
                  type="button"
                  :disabled="saving"
                  @click="resetQosEditor"
                >
                  New draft
                </button>
              </div>

              <form class="app-form-grid" @submit.prevent="saveQosDraft">
                <div class="app-form-field">
                  <label for="qos-organization">Organization</label>
                  <select
                    id="qos-organization"
                    v-model="qosForm.organization_id"
                    class="app-select"
                    :disabled="Boolean(selectedQosSubmissionId)"
                  >
                    <option value="">Select organization</option>
                    <option
                      v-for="organization in qosOrganizations"
                      :key="organization.id"
                      :value="organization.id"
                    >
                      {{ organization.name }}
                    </option>
                  </select>
                </div>

                <div class="app-form-field">
                  <label for="qos-reporting-start">Reporting period start</label>
                  <input
                    id="qos-reporting-start"
                    v-model="qosForm.reporting_period_start"
                    class="app-input"
                    type="date"
                  />
                </div>

                <div class="app-form-field">
                  <label for="qos-reporting-end">Reporting period end</label>
                  <input
                    id="qos-reporting-end"
                    v-model="qosForm.reporting_period_end"
                    class="app-input"
                    type="date"
                  />
                </div>

                <div
                  v-for="(field, index) in qosFields"
                  :key="getFieldKey(field, index)"
                  class="app-form-field"
                >
                  <label :for="`qos-${getFieldKey(field, index)}`">
                    {{ field.label }}
                    <span v-if="field.required">*</span>
                  </label>

                  <textarea
                    v-if="getFieldType(field) === 'textarea'"
                    :id="`qos-${getFieldKey(field, index)}`"
                    v-model="qosPayloadValues[getFieldKey(field, index)]"
                    class="app-textarea"
                    :placeholder="field.description || field.label"
                  ></textarea>

                  <select
                    v-else-if="getFieldType(field) === 'select'"
                    :id="`qos-${getFieldKey(field, index)}`"
                    v-model="qosPayloadValues[getFieldKey(field, index)]"
                    class="app-select"
                  >
                    <option value="">Select {{ field.label }}</option>
                    <option
                      v-for="option in getFieldOptions(field)"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </option>
                  </select>

                  <input
                    v-else
                    :id="`qos-${getFieldKey(field, index)}`"
                    v-model="qosPayloadValues[getFieldKey(field, index)]"
                    class="app-input"
                    :type="getFieldType(field)"
                    :placeholder="field.description || field.label"
                  />
                </div>

                <div class="app-form-field">
                  <label for="qos-certificate-name">Certificate name</label>
                  <input
                    id="qos-certificate-name"
                    v-model="qosForm.certificate_name"
                    class="app-input"
                    type="text"
                    placeholder="Optional compliance certificate name"
                  />
                </div>

                <div class="app-form-field">
                  <label for="qos-certificate-reference">Certificate reference</label>
                  <input
                    id="qos-certificate-reference"
                    v-model="qosForm.certificate_reference"
                    class="app-input"
                    type="text"
                    placeholder="Optional certificate reference"
                  />
                </div>

                <div class="app-form-field">
                  <label for="qos-certificate-expiry">Certificate expiry date</label>
                  <input
                    id="qos-certificate-expiry"
                    v-model="qosForm.certificate_expiry_date"
                    class="app-input"
                    type="date"
                  />
                </div>

                <div class="workspace-page__actions">
                  <button class="app-button" type="submit" :disabled="saving">
                    {{ selectedQosSubmissionId ? "Save draft changes" : "Save draft" }}
                  </button>
                  <button
                    class="app-button app-button--secondary"
                    type="button"
                    :disabled="saving"
                    @click="submitQosRecord"
                  >
                    {{ selectedQosSubmissionId ? "Submit record" : "Save and submit" }}
                  </button>
                </div>
              </form>
            </article>

            <article class="app-panel">
              <div class="app-section-head">
                <div>
                  <h3>DQO monitoring</h3>
                  <p>Live DQO metrics are pulled from the API's enhanced monitoring endpoint.</p>
                </div>
              </div>

              <div class="workspace-page__filter-row">
                <label for="qos-service-filter">Service</label>
                <select
                  id="qos-service-filter"
                  v-model="qosServiceFilter"
                  class="app-select workspace-page__filter-select"
                  @change="loadQosMetrics"
                >
                  <option value="all">All services</option>
                  <option value="voice">Voice</option>
                  <option value="data">Data</option>
                  <option value="sms">SMS</option>
                </select>
              </div>

              <div v-if="qosMetrics" class="workspace-page__monitor-stack">
                <article class="workspace-page__monitor-card app-panel-muted">
                  <p>Quality score</p>
                  <strong>{{ qosMetrics.compliance_overview?.status || "N/A" }}</strong>
                  <span>{{ qosMetrics.summary }}</span>
                </article>

                <article class="workspace-page__monitor-card app-panel-muted">
                  <p>Districts tracked</p>
                  <strong>{{ qosMetrics.map?.features?.length || 0 }}</strong>
                  <span>{{ qosMetrics.history_window_months || 0 }} month history window</span>
                </article>

                <article class="workspace-page__monitor-card app-panel-muted">
                  <p>Flagged issues</p>
                  <strong>{{ qosMetrics.compliance_overview?.flagged_issue_count || 0 }}</strong>
                  <span>
                    {{
                      qosMetrics.compliance_overview?.follow_up_count || 0
                    }}
                    follow-up item{{
                      (qosMetrics.compliance_overview?.follow_up_count || 0) === 1 ? "" : "s"
                    }}
                  </span>
                </article>
              </div>

              <div v-if="qosMetrics?.attention_items?.length" class="workspace-page__attention-list">
                <strong>Attention items</strong>
                <ul class="app-list">
                  <li v-for="item in qosMetrics.attention_items" :key="item">{{ item }}</li>
                </ul>
              </div>
            </article>
          </section>

          <section class="workspace-page__grid workspace-page__grid--balanced">
            <article class="app-panel">
              <div class="app-section-head">
                <div>
                  <h3>QoS submissions</h3>
                  <p>Continue draft or rejected items and inspect submitted records.</p>
                </div>
              </div>

              <div class="app-table-wrap">
                <table v-if="paginatedQosSubmissions.items.length" class="app-table">
                  <thead>
                    <tr>
                      <th>Period</th>
                      <th>Organization</th>
                      <th>Status</th>
                      <th>Submitted</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="submission in paginatedQosSubmissions.items" :key="submission.id">
                      <td>
                        {{ formatDate(submission.reporting_period_start) }} to
                        {{ formatDate(submission.reporting_period_end) }}
                      </td>
                      <td>{{ organizationName(submission.organization_id, qosOrganizations) }}</td>
                      <td>
                        <span class="app-status-pill" :class="statusTone(submission.status)">
                          {{ humanizeToken(submission.status) }}
                        </span>
                      </td>
                      <td>
                        {{
                          submission.submitted_at
                            ? formatDateTime(submission.submitted_at)
                            : "Draft only"
                        }}
                      </td>
                      <td>
                        <button
                          class="app-button app-button--secondary"
                          type="button"
                          @click="openQosSubmission(submission)"
                        >
                          {{ isEditableComplianceStatus(submission.status) ? "Continue" : "View" }}
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p v-else class="app-note">No QoS submissions have been created yet.</p>
              </div>

              <div v-if="paginatedQosSubmissions.totalPages > 1" class="workspace-page__pagination">
                <button
                  class="app-button app-button--secondary"
                  type="button"
                  :disabled="paginatedQosSubmissions.page <= 1"
                  @click="setPage(qosPage, paginatedQosSubmissions.page - 1, paginatedQosSubmissions.totalPages)"
                >
                  Previous
                </button>
                <span>Page {{ paginatedQosSubmissions.page }} of {{ paginatedQosSubmissions.totalPages }}</span>
                <button
                  class="app-button app-button--secondary"
                  type="button"
                  :disabled="paginatedQosSubmissions.page >= paginatedQosSubmissions.totalPages"
                  @click="setPage(qosPage, paginatedQosSubmissions.page + 1, paginatedQosSubmissions.totalPages)"
                >
                  Next
                </button>
              </div>
            </article>

            <article class="app-panel">
              <div class="app-section-head">
                <div>
                  <h3>Expiry tracker</h3>
                  <p>Compliance certificates and licence expiries within the selected horizon.</p>
                </div>
              </div>

              <div class="workspace-page__expiry-stack">
                <article class="app-panel-muted">
                  <strong>License expiries</strong>
                  <ul v-if="qosExpiryTracker.license_expiries?.length" class="workspace-page__mini-list">
                    <li
                      v-for="license in qosExpiryTracker.license_expiries.slice(0, 5)"
                      :key="license.license_number"
                    >
                      <span>{{ license.license_number }}</span>
                      <strong>{{ formatDaysUntilExpiry(license.days_until_expiry) }}</strong>
                    </li>
                  </ul>
                  <p v-else>No upcoming licence expiries in the selected window.</p>
                </article>

                <article class="app-panel-muted">
                  <strong>Certificate expiries</strong>
                  <ul
                    v-if="qosExpiryTracker.certificate_expiries?.length"
                    class="workspace-page__mini-list"
                  >
                    <li
                      v-for="certificate in qosExpiryTracker.certificate_expiries.slice(0, 5)"
                      :key="certificate.compliance_submission_id"
                    >
                      <span>{{ certificate.certificate_name }}</span>
                      <strong>{{ formatDaysUntilExpiry(certificate.days_until_expiry) }}</strong>
                    </li>
                  </ul>
                  <p v-else>No certificate expiries were returned for this account.</p>
                </article>
              </div>
            </article>
          </section>
        </template>

        <template v-else-if="shellKey === 'complaints'">
          <section class="workspace-page__grid workspace-page__grid--balanced">
            <article class="app-panel">
              <div class="app-section-head">
                <div>
                  <h3>Intake lane</h3>
                  <p>
                    The current API supports complaint, dispute, and appeal intake directly. It does
                    not expose an applicant-side submissions listing endpoint, so this page shows
                    the latest receipts stored in the browser after successful submission.
                  </p>
                </div>
              </div>

              <div class="app-tab-row">
                <button
                  v-for="item in publicSubmissionTypes"
                  :key="item.code"
                  class="app-tab"
                  :class="{ 'is-active': item.code === complaintType }"
                  type="button"
                  @click="complaintType = item.code"
                >
                  {{ item.label }}
                </button>
              </div>

              <form class="app-form-grid" @submit.prevent="submitPublicServiceIntake">
                <div class="app-form-field">
                  <label for="intake-contact-name">Contact name</label>
                  <input
                    id="intake-contact-name"
                    v-model="complaintForm.contact_name"
                    class="app-input"
                    type="text"
                  />
                </div>

                <div class="app-form-field">
                  <label for="intake-contact-email">Contact email</label>
                  <input
                    id="intake-contact-email"
                    v-model="complaintForm.contact_email"
                    class="app-input"
                    type="email"
                  />
                </div>

                <div class="app-form-field">
                  <label for="intake-contact-phone">Contact phone</label>
                  <input
                    id="intake-contact-phone"
                    v-model="complaintForm.contact_phone"
                    class="app-input"
                    type="tel"
                  />
                </div>

                <div class="app-form-field">
                  <label for="intake-organization-name">Organization</label>
                  <input
                    id="intake-organization-name"
                    v-model="complaintForm.organization_name"
                    class="app-input"
                    type="text"
                  />
                </div>

                <div class="app-form-field">
                  <label for="intake-subject">Subject</label>
                  <input
                    id="intake-subject"
                    v-model="complaintForm.subject"
                    class="app-input"
                    type="text"
                  />
                </div>

                <div class="app-form-field">
                  <label for="intake-related-reference">
                    Related reference
                    <span v-if="complaintType !== 'complaint'">*</span>
                  </label>
                  <input
                    id="intake-related-reference"
                    v-model="complaintForm.related_reference"
                    class="app-input"
                    type="text"
                    :placeholder="
                      complaintType === 'complaint'
                        ? 'Optional BOCRA or operator reference'
                        : 'Required application, invoice, or decision reference'
                    "
                  />
                </div>

                <div class="app-form-field">
                  <label for="intake-channel">Preferred contact channel</label>
                  <select
                    id="intake-channel"
                    v-model="complaintForm.preferred_contact_channel"
                    class="app-select"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="portal">Portal</option>
                  </select>
                </div>

                <div class="app-form-field">
                  <label for="intake-issue-area">Issue area</label>
                  <input
                    id="intake-issue-area"
                    v-model="complaintForm.issue_area"
                    class="app-input"
                    type="text"
                    placeholder="Billing, service quality, licensing, payment, etc."
                  />
                </div>

                <div class="app-form-field">
                  <label for="intake-preferred-outcome">Preferred outcome</label>
                  <input
                    id="intake-preferred-outcome"
                    v-model="complaintForm.preferred_outcome"
                    class="app-input"
                    type="text"
                    placeholder="Describe the resolution you are seeking"
                  />
                </div>

                <div class="app-form-field app-form-field--full">
                  <label for="intake-description">Description</label>
                  <textarea
                    id="intake-description"
                    v-model="complaintForm.description"
                    class="app-textarea"
                    placeholder="Provide the facts, dates, and any actions already taken."
                  ></textarea>
                </div>

                <div class="workspace-page__actions">
                  <button class="app-button" type="submit" :disabled="saving">
                    Submit {{ publicSubmissionLabel(complaintType) }}
                  </button>
                </div>
              </form>
            </article>

            <article class="app-panel">
              <div class="app-section-head">
                <div>
                  <h3>Reference receipts</h3>
                  <p>Local receipt history captured after successful submissions from this browser.</p>
                </div>
              </div>

              <div v-if="complaintsGuide" class="workspace-page__guide-box app-panel-muted">
                <strong>{{ complaintsGuide.title }}</strong>
                <p>{{ complaintsGuide.summary }}</p>
                <a
                  class="workspace-page__link-button"
                  :href="complaintsGuide.download_url"
                  target="_blank"
                  rel="noreferrer"
                >
                  Download guide
                </a>
              </div>

              <div class="app-table-wrap">
                <table v-if="complaintReceipts.length" class="app-table">
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="receipt in complaintReceipts" :key="receipt.reference_number">
                      <td>{{ receipt.reference_number }}</td>
                      <td>{{ publicSubmissionLabel(receipt.submission_type) }}</td>
                      <td>
                        <span class="app-status-pill" :class="statusTone(receipt.status)">
                          {{ humanizeToken(receipt.status) }}
                        </span>
                      </td>
                      <td>{{ formatDateTime(receipt.submitted_at) }}</td>
                    </tr>
                  </tbody>
                </table>
                <p v-else class="app-note">No local receipts yet. Submit a complaint, dispute, or appeal to see the receipt here.</p>
              </div>
            </article>
          </section>
        </template>

        <template v-else-if="shellKey === 'reports'">
          <section class="workspace-page__grid workspace-page__grid--balanced">
            <article class="app-panel">
              <div class="app-section-head">
                <div>
                  <h3>Invoices</h3>
                  <p>Review invoice totals, download invoice packs, and launch payments.</p>
                </div>
              </div>

              <div class="app-table-wrap">
                <table v-if="paginatedInvoices.items.length" class="app-table">
                  <thead>
                    <tr>
                      <th>Invoice</th>
                      <th>Application</th>
                      <th>Status</th>
                      <th>Due</th>
                      <th>Total</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="invoice in paginatedInvoices.items" :key="invoice.id">
                      <td>{{ invoice.invoice_number }}</td>
                      <td>{{ applicationTitle(invoice.application_id) }}</td>
                      <td>
                        <span class="app-status-pill" :class="statusTone(invoice.status)">
                          {{ humanizeToken(invoice.status) }}
                        </span>
                      </td>
                      <td>{{ invoice.due_date ? formatDate(invoice.due_date) : "Not set" }}</td>
                      <td>{{ formatCurrency(invoice.total_amount, invoice.currency) }}</td>
                      <td class="workspace-page__table-actions">
                        <button
                          class="app-button app-button--secondary"
                          type="button"
                          @click="selectInvoice(invoice.id)"
                        >
                          Inspect
                        </button>
                        <a
                          class="workspace-page__link-button"
                          :href="resolveApiUrl(`/payments/invoices/${invoice.id}/download`)"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Download
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p v-else class="app-note">No invoices are available for this account.</p>
              </div>

              <div v-if="paginatedInvoices.totalPages > 1" class="workspace-page__pagination">
                <button
                  class="app-button app-button--secondary"
                  type="button"
                  :disabled="paginatedInvoices.page <= 1"
                  @click="setPage(invoicePage, paginatedInvoices.page - 1, paginatedInvoices.totalPages)"
                >
                  Previous
                </button>
                <span>Page {{ paginatedInvoices.page }} of {{ paginatedInvoices.totalPages }}</span>
                <button
                  class="app-button app-button--secondary"
                  type="button"
                  :disabled="paginatedInvoices.page >= paginatedInvoices.totalPages"
                  @click="setPage(invoicePage, paginatedInvoices.page + 1, paginatedInvoices.totalPages)"
                >
                  Next
                </button>
              </div>
            </article>

            <article class="app-panel">
              <div class="app-section-head">
                <div>
                  <h3>Payment action</h3>
                  <p>
                    Start a payment from the selected invoice and run status checks against existing
                    payment references.
                  </p>
                </div>
              </div>

              <div v-if="selectedInvoice" class="workspace-page__invoice-summary app-panel-muted">
                <strong>{{ selectedInvoice.invoice_number }}</strong>
                <p>{{ applicationTitle(selectedInvoice.application_id) }}</p>
                <span>
                  Outstanding
                  {{ formatCurrency(selectedInvoice.outstanding_amount, selectedInvoice.currency) }}
                </span>
              </div>
              <p v-else class="app-note">Select an invoice to launch a payment.</p>

              <form v-if="selectedInvoice" class="app-form-grid" @submit.prevent="initiateSelectedInvoicePayment">
                <div class="app-form-field">
                  <label for="payment-provider">Provider</label>
                  <select
                    id="payment-provider"
                    v-model="paymentForm.provider_code"
                    class="app-select"
                  >
                    <option value="">Select provider</option>
                    <option v-for="provider in paymentProviders" :key="provider.code" :value="provider.code">
                      {{ provider.name }}
                    </option>
                  </select>
                </div>

                <div class="app-form-field">
                  <label for="payment-amount">Amount</label>
                  <input
                    id="payment-amount"
                    v-model="paymentForm.amount"
                    class="app-input"
                    type="number"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div class="app-form-field">
                  <label for="payment-reference">Payer reference</label>
                  <input
                    id="payment-reference"
                    v-model="paymentForm.payer_reference"
                    class="app-input"
                    type="text"
                    placeholder="Optional payer or memo reference"
                  />
                </div>

                <div v-if="selectedPaymentProvider?.supported_mnos?.length" class="app-form-field">
                  <label for="payment-mno">Mobile network</label>
                  <select id="payment-mno" v-model="paymentForm.mno_code" class="app-select">
                    <option value="">Select MNO</option>
                    <option v-for="mno in selectedPaymentProvider.supported_mnos" :key="mno" :value="mno">
                      {{ humanizeToken(mno) }}
                    </option>
                  </select>
                </div>

                <div class="app-form-field">
                  <label for="payment-phone">Phone number</label>
                  <input
                    id="payment-phone"
                    v-model="paymentForm.phone_number"
                    class="app-input"
                    type="tel"
                    placeholder="Required for mobile money journeys"
                  />
                </div>

                <div class="workspace-page__actions">
                  <button class="app-button" type="submit" :disabled="saving">
                    Initiate payment
                  </button>
                </div>
              </form>

              <div v-if="selectedPaymentDetail" class="workspace-page__payment-detail app-panel-muted">
                <strong>{{ selectedPaymentDetail.payment_reference }}</strong>
                <p>
                  {{ humanizeToken(selectedPaymentDetail.status) }} via
                  {{ humanizeToken(selectedPaymentDetail.provider_code) }}
                </p>
                <div class="workspace-page__actions">
                  <button
                    class="app-button app-button--secondary"
                    type="button"
                    :disabled="saving"
                    @click="statusCheckSelectedPayment"
                  >
                    Run status check
                  </button>
                  <a
                    v-if="selectedPaymentDetail.receipt?.id"
                    class="workspace-page__link-button"
                    :href="resolveApiUrl(`/payments/receipts/${selectedPaymentDetail.receipt.id}/download`)"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Download receipt
                  </a>
                </div>
              </div>
            </article>
          </section>

          <section class="app-panel">
            <div class="app-section-head">
              <div>
                <h3>Payments</h3>
                <p>Paginated payment history with on-demand detail loading.</p>
              </div>
            </div>

            <div class="app-table-wrap">
              <table v-if="paginatedPayments.items.length" class="app-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Provider</th>
                    <th>Status</th>
                    <th>Amount</th>
                    <th>Initiated</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="payment in paginatedPayments.items" :key="payment.id">
                    <td>{{ payment.payment_reference }}</td>
                    <td>{{ humanizeToken(payment.provider_code) }}</td>
                    <td>
                      <span class="app-status-pill" :class="statusTone(payment.status)">
                        {{ humanizeToken(payment.status) }}
                      </span>
                    </td>
                    <td>{{ formatCurrency(payment.amount, payment.currency) }}</td>
                    <td>{{ payment.initiated_at ? formatDateTime(payment.initiated_at) : "Not available" }}</td>
                    <td>
                      <button
                        class="app-button app-button--secondary"
                        type="button"
                        @click="inspectPayment(payment.id)"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <p v-else class="app-note">No payment records are available yet.</p>
            </div>

            <div v-if="paginatedPayments.totalPages > 1" class="workspace-page__pagination">
              <button
                class="app-button app-button--secondary"
                type="button"
                :disabled="paginatedPayments.page <= 1"
                @click="setPage(paymentPage, paginatedPayments.page - 1, paginatedPayments.totalPages)"
              >
                Previous
              </button>
              <span>Page {{ paginatedPayments.page }} of {{ paginatedPayments.totalPages }}</span>
              <button
                class="app-button app-button--secondary"
                type="button"
                :disabled="paginatedPayments.page >= paginatedPayments.totalPages"
                @click="setPage(paymentPage, paginatedPayments.page + 1, paginatedPayments.totalPages)"
              >
                Next
              </button>
            </div>
          </section>
        </template>

        <template v-else-if="shellKey === 'support'">
          <section class="workspace-page__grid workspace-page__grid--balanced">
            <article class="app-panel">
              <div class="app-section-head">
                <div>
                  <h3>Application context</h3>
                  <p>Select the record you need help with, then create or continue a message thread.</p>
                </div>
              </div>

              <div class="app-table-wrap">
                <table v-if="paginatedSupportApplications.items.length" class="app-table">
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Application</th>
                      <th>Status</th>
                      <th>Updated</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="application in paginatedSupportApplications.items" :key="application.id">
                      <td>{{ application.reference_number || "Draft" }}</td>
                      <td>{{ application.title }}</td>
                      <td>
                        <span class="app-status-pill" :class="getApplicationStatusMeta(application.status).tone">
                          {{ getApplicationStatusMeta(application.status).label }}
                        </span>
                      </td>
                      <td>{{ formatDateTime(application.updated_at || application.created_at) }}</td>
                      <td>
                        <button
                          class="app-button app-button--secondary"
                          type="button"
                          @click="selectSupportApplication(application.id)"
                        >
                          Open threads
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p v-else class="app-note">No applications are available to link to support.</p>
              </div>

              <div
                v-if="paginatedSupportApplications.totalPages > 1"
                class="workspace-page__pagination"
              >
                <button
                  class="app-button app-button--secondary"
                  type="button"
                  :disabled="paginatedSupportApplications.page <= 1"
                  @click="
                    setPage(
                      supportApplicationPage,
                      paginatedSupportApplications.page - 1,
                      paginatedSupportApplications.totalPages,
                    )
                  "
                >
                  Previous
                </button>
                <span>
                  Page {{ paginatedSupportApplications.page }} of
                  {{ paginatedSupportApplications.totalPages }}
                </span>
                <button
                  class="app-button app-button--secondary"
                  type="button"
                  :disabled="paginatedSupportApplications.page >= paginatedSupportApplications.totalPages"
                  @click="
                    setPage(
                      supportApplicationPage,
                      paginatedSupportApplications.page + 1,
                      paginatedSupportApplications.totalPages,
                    )
                  "
                >
                  Next
                </button>
              </div>
            </article>

            <article class="app-panel">
              <div class="app-section-head">
                <div>
                  <h3>Message threads</h3>
                  <p>
                    {{
                      selectedSupportApplication
                        ? `Messaging against ${selectedSupportApplication.title}.`
                        : "Select an application to load its support threads."
                    }}
                  </p>
                </div>
              </div>

              <p v-if="supportThreadsLoading" class="app-note">Loading message threads...</p>

              <template v-else-if="selectedSupportApplication">
                <div class="workspace-page__thread-list">
                  <button
                    v-for="thread in orderedSupportThreads"
                    :key="thread.id"
                    class="workspace-page__thread-item"
                    :class="{ 'is-active': thread.id === selectedThreadId }"
                    type="button"
                    @click="selectedThreadId = thread.id"
                  >
                    <strong>{{ thread.subject }}</strong>
                    <p>{{ thread.latest_message_preview || "Thread created." }}</p>
                    <span>{{ thread.latest_message_at ? formatDateTime(thread.latest_message_at) : formatDateTime(thread.created_at) }}</span>
                  </button>
                </div>

                <form class="app-form-grid workspace-page__thread-form" @submit.prevent="createSupportThread">
                  <div class="app-form-field">
                    <label for="support-subject">New thread subject</label>
                    <input
                      id="support-subject"
                      v-model="supportThreadForm.subject"
                      class="app-input"
                      type="text"
                    />
                  </div>

                  <div class="app-form-field app-form-field--full">
                    <label for="support-body">Opening message</label>
                    <textarea
                      id="support-body"
                      v-model="supportThreadForm.body"
                      class="app-textarea"
                    ></textarea>
                  </div>

                  <div class="workspace-page__actions">
                    <button class="app-button" type="submit" :disabled="saving">
                      Create thread
                    </button>
                  </div>
                </form>

                <div v-if="selectedSupportThread" class="workspace-page__message-stack">
                  <article
                    v-for="message in selectedSupportMessages"
                    :key="message.id"
                    class="workspace-page__message-card"
                    :class="{ 'is-applicant': message.sender_type === 'applicant' }"
                  >
                    <strong>{{ message.sender_name || humanizeToken(message.sender_type) }}</strong>
                    <p>{{ message.body }}</p>
                    <span>{{ formatDateTime(message.sent_at || message.created_at) }}</span>
                  </article>

                  <form class="app-form-grid" @submit.prevent="replySupportThread">
                    <div class="app-form-field app-form-field--full">
                      <label for="support-reply">Reply</label>
                      <textarea
                        id="support-reply"
                        v-model="supportReplyBody"
                        class="app-textarea"
                        placeholder="Reply to BOCRA in the selected thread."
                      ></textarea>
                    </div>

                    <div class="workspace-page__actions">
                      <button class="app-button" type="submit" :disabled="saving">
                        Send reply
                      </button>
                    </div>
                  </form>
                </div>
                <p v-else class="app-note">No threads have been started for this application yet.</p>
              </template>

              <p v-else class="app-note">Select an application first to open support messaging.</p>
            </article>
          </section>
        </template>

        <template v-else-if="shellKey === 'settings'">
          <section class="workspace-page__grid workspace-page__grid--balanced">
            <article class="app-panel">
              <div class="app-section-head">
                <div>
                  <h3>Organizations</h3>
                  <p>Create, inspect, or update organizations available to this account.</p>
                </div>

                <button
                  class="app-button app-button--secondary"
                  type="button"
                  :disabled="saving"
                  @click="startOrganizationCreate"
                >
                  New organization
                </button>
              </div>

              <div class="workspace-page__organization-list">
                <button
                  v-for="organization in paginatedOrganizations.items"
                  :key="organization.id"
                  class="workspace-page__organization-item"
                  :class="{ 'is-active': organization.id === selectedOrganizationId }"
                  type="button"
                  @click="selectOrganization(organization.id)"
                >
                  <strong>{{ organization.name }}</strong>
                  <p>{{ humanizeToken(organization.organization_type) }}</p>
                  <span>{{ humanizeToken(organization.registry_verification_status || "pending") }}</span>
                </button>
              </div>

              <div v-if="paginatedOrganizations.totalPages > 1" class="workspace-page__pagination">
                <button
                  class="app-button app-button--secondary"
                  type="button"
                  :disabled="paginatedOrganizations.page <= 1"
                  @click="
                    setPage(
                      organizationPage,
                      paginatedOrganizations.page - 1,
                      paginatedOrganizations.totalPages,
                    )
                  "
                >
                  Previous
                </button>
                <span>
                  Page {{ paginatedOrganizations.page }} of {{ paginatedOrganizations.totalPages }}
                </span>
                <button
                  class="app-button app-button--secondary"
                  type="button"
                  :disabled="paginatedOrganizations.page >= paginatedOrganizations.totalPages"
                  @click="
                    setPage(
                      organizationPage,
                      paginatedOrganizations.page + 1,
                      paginatedOrganizations.totalPages,
                    )
                  "
                >
                  Next
                </button>
              </div>
            </article>

            <article class="app-panel">
              <div class="app-section-head">
                <div>
                  <h3>{{ organizationFormMode === 'create' ? "Create organization" : "Organization details" }}</h3>
                  <p>These fields map directly to the organization create and update endpoints.</p>
                </div>
              </div>

              <form class="app-form-grid" @submit.prevent="submitOrganizationForm">
                <div class="app-form-field">
                  <label for="organization-name">Name</label>
                  <input id="organization-name" v-model="organizationForm.name" class="app-input" type="text" />
                </div>

                <div class="app-form-field">
                  <label for="organization-reg">Registration number</label>
                  <input
                    id="organization-reg"
                    v-model="organizationForm.registration_number"
                    class="app-input"
                    type="text"
                  />
                </div>

                <div class="app-form-field">
                  <label for="organization-type">Organization type</label>
                  <select id="organization-type" v-model="organizationForm.organization_type" class="app-select">
                    <option value="company">Company</option>
                    <option value="government">Government</option>
                    <option value="ngo">NGO</option>
                    <option value="individual">Individual</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div class="app-form-field">
                  <label for="organization-tax">Tax identifier</label>
                  <input id="organization-tax" v-model="organizationForm.tax_identifier" class="app-input" type="text" />
                </div>

                <div class="app-form-field">
                  <label for="organization-email">Contact email</label>
                  <input id="organization-email" v-model="organizationForm.contact_email" class="app-input" type="email" />
                </div>

                <div class="app-form-field">
                  <label for="organization-phone">Contact phone</label>
                  <input id="organization-phone" v-model="organizationForm.contact_phone" class="app-input" type="tel" />
                </div>

                <div class="app-form-field">
                  <label for="organization-status">Status</label>
                  <input id="organization-status" v-model="organizationForm.status" class="app-input" type="text" />
                </div>

                <div class="app-form-field app-form-field--full">
                  <label for="organization-address">Address</label>
                  <textarea id="organization-address" v-model="organizationForm.address" class="app-textarea"></textarea>
                </div>

                <div class="workspace-page__actions">
                  <button class="app-button" type="submit" :disabled="saving">
                    {{ organizationFormMode === "create" ? "Create organization" : "Save changes" }}
                  </button>
                </div>
              </form>
            </article>
          </section>

          <section class="app-panel">
            <div class="app-section-head">
              <div>
                <h3>Organization members</h3>
                <p>
                  {{
                    selectedOrganization
                      ? `Managing members for ${selectedOrganization.name}.`
                      : "Select an organization to manage its members."
                  }}
                </p>
              </div>
            </div>

            <template v-if="selectedOrganization">
              <div class="app-table-wrap">
                <table v-if="paginatedMembers.items.length" class="app-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Title</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="member in paginatedMembers.items" :key="member.id">
                      <td>{{ member.user?.full_name || "Unknown member" }}</td>
                      <td>{{ member.user?.email || "No email" }}</td>
                      <td>
                        <span class="app-status-pill" :class="statusTone(member.membership_status)">
                          {{ humanizeToken(member.membership_status) }}
                        </span>
                      </td>
                      <td>{{ member.title || "No title" }}</td>
                      <td class="workspace-page__table-actions">
                        <button
                          class="app-button app-button--secondary"
                          type="button"
                          @click="selectMember(member)"
                        >
                          Edit
                        </button>
                        <button
                          class="app-button app-button--secondary"
                          type="button"
                          :disabled="saving"
                          @click="removeSelectedMember(member)"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p v-else class="app-note">No members are linked to this organization yet.</p>
              </div>

              <div v-if="paginatedMembers.totalPages > 1" class="workspace-page__pagination">
                <button
                  class="app-button app-button--secondary"
                  type="button"
                  :disabled="paginatedMembers.page <= 1"
                  @click="setPage(memberPage, paginatedMembers.page - 1, paginatedMembers.totalPages)"
                >
                  Previous
                </button>
                <span>Page {{ paginatedMembers.page }} of {{ paginatedMembers.totalPages }}</span>
                <button
                  class="app-button app-button--secondary"
                  type="button"
                  :disabled="paginatedMembers.page >= paginatedMembers.totalPages"
                  @click="setPage(memberPage, paginatedMembers.page + 1, paginatedMembers.totalPages)"
                >
                  Next
                </button>
              </div>

              <form class="app-form-grid workspace-page__member-form" @submit.prevent="submitMemberForm">
                <div class="app-form-field">
                  <label for="member-email">User email</label>
                  <input
                    id="member-email"
                    v-model="memberForm.email"
                    class="app-input"
                    type="email"
                    :disabled="Boolean(selectedMemberId)"
                    placeholder="Registered user email"
                  />
                </div>

                <div class="app-form-field">
                  <label for="member-title">Title</label>
                  <input id="member-title" v-model="memberForm.title" class="app-input" type="text" />
                </div>

                <div class="app-form-field">
                  <label for="member-status">Membership status</label>
                  <select id="member-status" v-model="memberForm.membership_status" class="app-select">
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="revoked">Revoked</option>
                  </select>
                </div>

                <div class="app-form-field">
                  <label for="member-role">Role code</label>
                  <input
                    id="member-role"
                    v-model="memberForm.role_code"
                    class="app-input"
                    type="text"
                    placeholder="For external users this is typically consultant_agent"
                  />
                </div>

                <label class="workspace-page__checkbox">
                  <input v-model="memberForm.is_primary_contact" type="checkbox" />
                  <span>Mark as primary contact</span>
                </label>

                <div class="workspace-page__actions">
                  <button class="app-button" type="submit" :disabled="saving">
                    {{ selectedMemberId ? "Save member" : "Add member" }}
                  </button>
                  <button
                    class="app-button app-button--secondary"
                    type="button"
                    :disabled="saving"
                    @click="resetMemberForm"
                  >
                    Clear
                  </button>
                </div>
              </form>
            </template>

            <p v-else class="app-note">Select or create an organization before managing its members.</p>
          </section>
        </template>

        <template v-else-if="shellKey === 'profile'">
          <section class="workspace-page__grid workspace-page__grid--balanced">
            <article class="app-panel">
              <div class="app-section-head">
                <div>
                  <h3>Account summary</h3>
                  <p>Live profile data from <code>/auth/me</code> with linked organization context.</p>
                </div>
              </div>

              <div v-if="profileUser" class="workspace-page__profile-grid">
                <article class="app-panel-muted">
                  <strong>{{ profileUser.full_name }}</strong>
                  <p>{{ profileUser.email }}</p>
                  <span>{{ formatRoleCodes(profileUser.role_codes) }}</span>
                </article>

                <article class="app-panel-muted">
                  <strong>Identity status</strong>
                  <p>{{ humanizeToken(profileUser.identity_verification_status) }}</p>
                  <span>
                    {{
                      profileUser.identity_verified_at
                        ? `Verified ${formatDateTime(profileUser.identity_verified_at)}`
                        : "Verification pending"
                    }}
                  </span>
                </article>

                <article class="app-panel-muted">
                  <strong>Contact state</strong>
                  <p>
                    Email {{ profileUser.is_email_verified ? "verified" : "not verified" }} • Phone
                    {{ profileUser.is_phone_verified ? "verified" : "not verified" }}
                  </p>
                  <span>{{ profileUser.phone_number || "No phone number recorded" }}</span>
                </article>

                <article class="app-panel-muted">
                  <strong>Organizations</strong>
                  <p>{{ profileOrganizations.length }} linked organization{{ profileOrganizations.length === 1 ? "" : "s" }}</p>
                  <span>{{ profileOrganizations.map((item) => item.name).join(", ") || "No linked organizations" }}</span>
                </article>
              </div>
              <p v-else class="app-note">Profile data is not available right now.</p>
            </article>

            <article class="app-panel">
              <div class="app-section-head">
                <div>
                  <h3>Identity verification</h3>
                  <p>Submit the exact request shape the API accepts for citizen or foreign-national verification.</p>
                </div>
              </div>

              <div class="app-tab-row">
                <button
                  class="app-tab"
                  :class="{ 'is-active': verificationMode === 'citizen' }"
                  type="button"
                  @click="verificationMode = 'citizen'"
                >
                  Citizen
                </button>
                <button
                  class="app-tab"
                  :class="{ 'is-active': verificationMode === 'foreign_national' }"
                  type="button"
                  @click="verificationMode = 'foreign_national'"
                >
                  Foreign national
                </button>
              </div>

              <form
                v-if="verificationMode === 'citizen'"
                class="app-form-grid"
                @submit.prevent="submitCitizenVerification"
              >
                <div class="app-form-field">
                  <label for="citizen-id">National ID number</label>
                  <input id="citizen-id" v-model="citizenForm.national_id_number" class="app-input" type="text" />
                </div>

                <div class="app-form-field">
                  <label for="citizen-front">Front document</label>
                  <input id="citizen-front" class="app-input" type="file" @change="handleCitizenDocument('front_document', $event)" />
                </div>

                <div class="app-form-field">
                  <label for="citizen-back">Back document</label>
                  <input id="citizen-back" class="app-input" type="file" @change="handleCitizenDocument('back_document', $event)" />
                </div>

                <div class="workspace-page__actions">
                  <button class="app-button" type="submit" :disabled="verifyingIdentity">
                    Verify citizen profile
                  </button>
                </div>
              </form>

              <form v-else class="app-form-grid" @submit.prevent="submitForeignVerification">
                <div class="app-form-field">
                  <label for="foreign-passport">Passport number</label>
                  <input id="foreign-passport" v-model="foreignForm.passport_number" class="app-input" type="text" />
                </div>

                <div class="app-form-field">
                  <label for="foreign-document">Passport document</label>
                  <input id="foreign-document" class="app-input" type="file" @change="handleForeignDocument($event)" />
                </div>

                <div class="workspace-page__actions">
                  <button class="app-button" type="submit" :disabled="verifyingIdentity">
                    Verify foreign-national profile
                  </button>
                </div>
              </form>
            </article>
          </section>
        </template>
      </template>
    </div>
  </ClientWorkspaceLayout>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import ClientWorkspaceLayout from "../components/auth/ClientWorkspaceLayout.vue";
import { placeholderPageContent } from "../data/authWorkspace";
import {
  addOrganizationMember,
  checkPaymentStatus,
  createApplicationMessageThread,
  createComplianceSubmission,
  createOrganization,
  fetchApplicationMessageThreads,
  fetchApplications,
  fetchComplianceExpiryTracker,
  fetchComplianceModules,
  fetchComplianceSubmissions,
  fetchCurrentUser,
  fetchDqoEnhancedMetrics,
  fetchInvoices,
  fetchOrganizations,
  fetchPayment,
  fetchPaymentProviders,
  fetchPayments,
  fetchPublicFeeStructure,
  fetchPublicGuidelines,
  fetchPublicLicenseCategories,
  fetchPublicNotices,
  initiateInvoicePayment,
  removeOrganizationMember,
  replyToApplicationMessageThread,
  resolveApiUrl,
  submitComplianceSubmission,
  submitPublicAppeal,
  submitPublicComplaint,
  submitPublicDispute,
  updateComplianceSubmission,
  updateOrganization,
  updateOrganizationMember,
  updateStoredUser,
  verifyCitizenIdentity,
  verifyForeignNationalIdentity,
} from "../lib/platformApi";
import {
  formatDate,
  formatDateTime,
  formatDaysUntilExpiry,
  formatRoleCodes,
  getApplicationStatusMeta,
  getFieldKey,
  getFieldOptions,
  getFieldType,
  humanizeToken,
  sortApplications,
} from "../lib/workspace";

const route = useRoute();
const PUBLIC_RECEIPTS_STORAGE_KEY = "bocra_platform_public_service_receipts";

const loading = ref(true);
const saving = ref(false);
const verifyingIdentity = ref(false);
const pageError = ref("");
const successMessage = ref("");

const guidelines = ref([]);
const notices = ref([]);
const feeStructure = ref([]);
const licenseCategories = ref([]);
const guidelinePage = ref(1);
const noticePage = ref(1);

const qosOrganizations = ref([]);
const qosModule = ref(null);
const qosSubmissions = ref([]);
const qosMetrics = ref(null);
const qosExpiryTracker = ref({
  within_days: 90,
  license_expiries: [],
  certificate_expiries: [],
});
const qosServiceFilter = ref("all");
const qosPayloadValues = reactive({});
const selectedQosSubmissionId = ref("");
const qosPage = ref(1);
const qosForm = reactive({
  organization_id: "",
  reporting_period_start: "",
  reporting_period_end: "",
  certificate_name: "",
  certificate_reference: "",
  certificate_expiry_date: "",
});

const complaintType = ref("complaint");
const complaintsGuide = ref(null);
const complaintReceipts = ref(readStoredReceipts());
const complaintForm = reactive({
  contact_name: "",
  contact_email: "",
  contact_phone: "",
  organization_name: "",
  subject: "",
  description: "",
  related_reference: "",
  preferred_contact_channel: "email",
  issue_area: "",
  preferred_outcome: "",
});

const supportApplications = ref([]);
const supportThreads = ref([]);
const supportThreadsLoading = ref(false);
const selectedSupportApplicationId = ref("");
const selectedThreadId = ref("");
const supportApplicationPage = ref(1);
const supportThreadForm = reactive({
  subject: "",
  body: "",
  visibility: "applicant_and_bocra",
});
const supportReplyBody = ref("");

const reportsApplications = ref([]);
const invoices = ref([]);
const payments = ref([]);
const paymentProviders = ref([]);
const selectedInvoiceId = ref("");
const selectedPaymentId = ref("");
const selectedPaymentDetail = ref(null);
const invoicePage = ref(1);
const paymentPage = ref(1);
const paymentForm = reactive({
  provider_code: "",
  amount: "",
  payer_reference: "",
  mno_code: "",
  phone_number: "",
});

const organizations = ref([]);
const selectedOrganizationId = ref("");
const selectedMemberId = ref("");
const organizationPage = ref(1);
const memberPage = ref(1);
const organizationFormMode = ref("create");
const organizationForm = reactive({
  name: "",
  registration_number: "",
  organization_type: "company",
  tax_identifier: "",
  contact_email: "",
  contact_phone: "",
  address: "",
  status: "active",
});
const memberForm = reactive({
  email: "",
  title: "",
  membership_status: "pending",
  is_primary_contact: false,
  role_code: "",
});

const profileUser = ref(null);
const profileOrganizations = ref([]);
const verificationMode = ref("citizen");
const citizenForm = reactive({
  national_id_number: "",
  front_document: null,
  back_document: null,
});
const foreignForm = reactive({
  passport_number: "",
  document: null,
});

const publicSubmissionTypes = [
  { code: "complaint", label: "Complaint" },
  { code: "dispute", label: "Dispute" },
  { code: "appeal", label: "Appeal" },
];

const shellKey = computed(() => route.meta?.shellKey || "type-approval");
const shell = computed(
  () =>
    placeholderPageContent[shellKey.value] || {
      badge: "Client workspace",
      summary: "This page is backed by the BOCRA API.",
    },
);

const loadingLabel = computed(() => {
  switch (shellKey.value) {
    case "type-approval":
      return "Loading type approval guidance, notices, and fee structure...";
    case "qos-monitoring":
      return "Loading QoS submissions, metrics, and expiry data...";
    case "complaints":
      return "Loading complaint intake workspace...";
    case "reports":
      return "Loading invoices, payments, and providers...";
    case "support":
      return "Loading application support context...";
    case "settings":
      return "Loading organizations and membership settings...";
    case "profile":
      return "Loading your profile and verification state...";
    default:
      return "Loading workspace...";
  }
});

const heroBadge = computed(() => {
  switch (shellKey.value) {
    case "type-approval":
      return `${licenseCategories.value.length} categories`;
    case "qos-monitoring":
      return `${qosSubmissions.value.length} QoS records`;
    case "complaints":
      return `${complaintReceipts.value.length} saved receipt${complaintReceipts.value.length === 1 ? "" : "s"}`;
    case "reports":
      return `${invoices.value.length} invoice${invoices.value.length === 1 ? "" : "s"}`;
    case "support":
      return `${supportThreads.value.length} thread${supportThreads.value.length === 1 ? "" : "s"}`;
    case "settings":
      return `${organizations.value.length} organization${organizations.value.length === 1 ? "" : "s"}`;
    case "profile":
      return profileUser.value?.identity_verification_status
        ? humanizeToken(profileUser.value.identity_verification_status)
        : "Profile";
    default:
      return "Workspace";
  }
});

const pageMetrics = computed(() => {
  switch (shellKey.value) {
    case "type-approval":
      return [
        {
          label: "Guidelines",
          value: String(guidelines.value.length).padStart(2, "0"),
          caption: "Public guidance records",
        },
        {
          label: "Notices",
          value: String(notices.value.length).padStart(2, "0"),
          caption: "Published notice items",
        },
        {
          label: "Categories",
          value: String(licenseCategories.value.length).padStart(2, "0"),
          caption: "Public licensing categories",
        },
        {
          label: "Fee Lines",
          value: String(countFeeEntries(feeStructure.value)).padStart(2, "0"),
          caption: "Catalogue fee entries",
        },
      ];
    case "qos-monitoring":
      return [
        {
          label: "Drafts",
          value: String(qosSubmissions.value.filter((item) => item.status === "draft").length).padStart(2, "0"),
          caption: "Editable QoS drafts",
        },
        {
          label: "Submitted",
          value: String(qosSubmissions.value.filter((item) => item.status === "submitted").length).padStart(2, "0"),
          caption: "Awaiting BOCRA review",
        },
        {
          label: "Flagged Issues",
          value: String(qosMetrics.value?.compliance_overview?.flagged_issue_count || 0).padStart(2, "0"),
          caption: "DQO issues requiring attention",
        },
        {
          label: "Expiring Items",
          value: String(
            (qosExpiryTracker.value.license_expiries?.length || 0) +
              (qosExpiryTracker.value.certificate_expiries?.length || 0),
          ).padStart(2, "0"),
          caption: "Licence and certificate expiries",
        },
      ];
    case "complaints":
      return [
        {
          label: "Intake Types",
          value: "03",
          caption: "Complaint, dispute, and appeal",
        },
        {
          label: "Saved Receipts",
          value: String(complaintReceipts.value.length).padStart(2, "0"),
          caption: "Browser-side receipt history",
        },
        {
          label: "Linked Refs",
          value: String(
            complaintReceipts.value.filter((item) => item.reference_number).length,
          ).padStart(2, "0"),
          caption: "Submitted with references",
        },
        {
          label: "Guide Packs",
          value: complaintsGuide.value ? "01" : "00",
          caption: "Related public guidance",
        },
      ];
    case "reports":
      return [
        {
          label: "Outstanding",
          value: formatCurrency(sumAmount(invoices.value, "outstanding_amount")),
          caption: "Remaining invoice balance",
        },
        {
          label: "Invoices",
          value: String(invoices.value.length).padStart(2, "0"),
          caption: "Visible invoice records",
        },
        {
          label: "Payments",
          value: String(payments.value.length).padStart(2, "0"),
          caption: "Recorded payment attempts",
        },
        {
          label: "Providers",
          value: String(paymentProviders.value.length).padStart(2, "0"),
          caption: "Available payment providers",
        },
      ];
    case "support":
      return [
        {
          label: "Applications",
          value: String(supportApplications.value.length).padStart(2, "0"),
          caption: "Support-linked applications",
        },
        {
          label: "Threads",
          value: String(supportThreads.value.length).padStart(2, "0"),
          caption: "Loaded for the selected application",
        },
        {
          label: "Messages",
          value: String(selectedSupportMessages.value.length).padStart(2, "0"),
          caption: "Messages in the selected thread",
        },
        {
          label: "Current Status",
          value: selectedSupportApplication.value
            ? getApplicationStatusMeta(selectedSupportApplication.value.status).label
            : "None",
          caption: "Selected application status",
        },
      ];
    case "settings":
      return [
        {
          label: "Organizations",
          value: String(organizations.value.length).padStart(2, "0"),
          caption: "Accessible organizations",
        },
        {
          label: "Members",
          value: String(totalMemberCount(organizations.value)).padStart(2, "0"),
          caption: "Linked organization members",
        },
        {
          label: "Registry Verified",
          value: String(
            organizations.value.filter((item) => item.registry_verification_status === "verified").length,
          ).padStart(2, "0"),
          caption: "CIPA verified organizations",
        },
        {
          label: "Primary Contacts",
          value: String(
            organizations.value.reduce(
              (total, item) => total + item.members.filter((member) => member.is_primary_contact).length,
              0,
            ),
          ).padStart(2, "0"),
          caption: "Primary member contacts",
        },
      ];
    case "profile":
      return [
        {
          label: "Roles",
          value: String(profileUser.value?.role_codes?.length || 0).padStart(2, "0"),
          caption: "Assigned account roles",
        },
        {
          label: "Organizations",
          value: String(profileOrganizations.value.length).padStart(2, "0"),
          caption: "Linked organizations",
        },
        {
          label: "Identity",
          value: profileUser.value?.identity_verification_status
            ? humanizeToken(profileUser.value.identity_verification_status)
            : "Unknown",
          caption: "Current verification status",
        },
        {
          label: "MFA",
          value: profileUser.value?.mfa_enabled ? "Enabled" : "Disabled",
          caption: "Current sign-in protection",
        },
      ];
    default:
      return [];
  }
});

const paginatedGuidelines = computed(() => paginateItems(guidelines.value, guidelinePage.value, 4));
const paginatedNotices = computed(() => paginateItems(notices.value, noticePage.value, 4));
const paginatedQosSubmissions = computed(() => paginateItems(qosSubmissions.value, qosPage.value, 5));
const paginatedSupportApplications = computed(() =>
  paginateItems(supportApplications.value, supportApplicationPage.value, 6),
);
const paginatedInvoices = computed(() => paginateItems(invoices.value, invoicePage.value, 6));
const paginatedPayments = computed(() => paginateItems(payments.value, paymentPage.value, 6));
const paginatedOrganizations = computed(() => paginateItems(organizations.value, organizationPage.value, 4));
const paginatedMembers = computed(() =>
  paginateItems(selectedOrganization.value?.members || [], memberPage.value, 5),
);
const qosFields = computed(() => qosModule.value?.payload_fields || []);
const selectedQosSubmission = computed(
  () => qosSubmissions.value.find((item) => item.id === selectedQosSubmissionId.value) || null,
);
const orderedSupportThreads = computed(() =>
  [...supportThreads.value].sort((left, right) => {
    const rightValue = new Date(right.latest_message_at || right.created_at || 0).getTime();
    const leftValue = new Date(left.latest_message_at || left.created_at || 0).getTime();
    return rightValue - leftValue;
  }),
);
const selectedSupportApplication = computed(
  () => supportApplications.value.find((item) => item.id === selectedSupportApplicationId.value) || null,
);
const selectedSupportThread = computed(
  () => supportThreads.value.find((item) => item.id === selectedThreadId.value) || null,
);
const selectedSupportMessages = computed(() =>
  [...(selectedSupportThread.value?.messages || [])].sort((left, right) => {
    const leftValue = new Date(left.sent_at || left.created_at || 0).getTime();
    const rightValue = new Date(right.sent_at || right.created_at || 0).getTime();
    return leftValue - rightValue;
  }),
);
const selectedInvoice = computed(() => invoices.value.find((item) => item.id === selectedInvoiceId.value) || null);
const selectedPaymentProvider = computed(
  () => paymentProviders.value.find((item) => item.code === paymentForm.provider_code) || null,
);
const selectedOrganization = computed(
  () => organizations.value.find((item) => item.id === selectedOrganizationId.value) || null,
);

watch(
  () => shellKey.value,
  async () => {
    await loadRouteData();
  },
  { immediate: true },
);

watch(
  () => paymentForm.provider_code,
  () => {
    const provider = selectedPaymentProvider.value;
    if (!provider?.supported_mnos?.length) {
      return;
    }

    if (!provider.supported_mnos.includes(paymentForm.mno_code)) {
      paymentForm.mno_code = provider.supported_mnos[0];
    }
  },
);

function readStoredReceipts() {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return [];
  }

  try {
    const parsed = JSON.parse(localStorage.getItem(PUBLIC_RECEIPTS_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

function persistStoredReceipts() {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return;
  }

  localStorage.setItem(
    PUBLIC_RECEIPTS_STORAGE_KEY,
    JSON.stringify(complaintReceipts.value.slice(0, 12)),
  );
}

function clearReactiveObject(target) {
  Object.keys(target).forEach((key) => {
    delete target[key];
  });
}

function countFeeEntries(categories = []) {
  return categories.reduce(
    (total, category) =>
      total +
      (category.license_types || []).reduce(
        (categoryTotal, licenseType) => categoryTotal + (licenseType.fees || []).length,
        0,
      ),
    0,
  );
}

function sumAmount(records = [], fieldName) {
  return records.reduce((total, item) => total + Number(item?.[fieldName] || 0), 0);
}

function totalMemberCount(items = []) {
  return items.reduce((total, item) => total + (item.members?.length || 0), 0);
}

function paginateItems(items = [], page = 1, pageSize = 5) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize) || 1);
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  return {
    page: currentPage,
    totalPages,
    items: items.slice(startIndex, startIndex + pageSize),
  };
}

function setPage(targetRef, nextPage, totalPages) {
  targetRef.value = Math.min(Math.max(nextPage, 1), Math.max(totalPages, 1));
}

function formatCurrency(value, currency = "BWP") {
  const numericValue = Number(value || 0);

  try {
    return new Intl.NumberFormat("en-BW", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(numericValue);
  } catch (_error) {
    return `${currency} ${numericValue.toFixed(2)}`;
  }
}

function statusTone(status) {
  const normalized = String(status || "").toLowerCase();

  if (
    [
      "approved",
      "accepted",
      "active",
      "verified",
      "paid",
      "settled",
      "reconciled",
      "resolved",
      "issued",
    ].includes(normalized)
  ) {
    return "app-status-pill--success";
  }

  if (
    [
      "rejected",
      "failed",
      "expired",
      "revoked",
      "overdue",
      "resubmission_required",
      "suspended",
      "revoked",
    ].includes(normalized)
  ) {
    return "app-status-pill--danger";
  }

  return "app-status-pill--warning";
}

function isEditableComplianceStatus(status) {
  return ["draft", "rejected"].includes(String(status || "").toLowerCase());
}

function upsertById(collection = [], record) {
  const nextCollection = collection.filter((item) => item.id !== record.id);
  return [record, ...nextCollection].sort((left, right) => {
    const rightValue = new Date(right.updated_at || right.created_at || 0).getTime();
    const leftValue = new Date(left.updated_at || left.created_at || 0).getTime();
    return rightValue - leftValue;
  });
}

function organizationName(organizationId, collection = organizations.value) {
  return collection.find((item) => item.id === organizationId)?.name || "Linked organization";
}

function applicationTitle(applicationId) {
  return reportsApplications.value.find((item) => item.id === applicationId)?.title || applicationId;
}

function publicSubmissionLabel(code) {
  return publicSubmissionTypes.find((item) => item.code === code)?.label || humanizeToken(code);
}

function normalizeValueByField(field, value) {
  if (value === undefined || value === null || value === "") {
    return value;
  }

  const fieldType = getFieldType(field);
  if (fieldType === "number") {
    const numericValue = Number(value);
    return Number.isNaN(numericValue) ? value : numericValue;
  }

  return typeof value === "string" ? value.trim() : value;
}

function buildDynamicPayload(fields, values) {
  return fields.reduce((payload, field, index) => {
    const key = getFieldKey(field, index);
    const normalizedValue = normalizeValueByField(field, values[key]);
    if (normalizedValue !== undefined && normalizedValue !== null && normalizedValue !== "") {
      payload[key] = normalizedValue;
    }
    return payload;
  }, {});
}

function populateQosPayloadValues(payload = {}) {
  clearReactiveObject(qosPayloadValues);
  qosFields.value.forEach((field, index) => {
    const key = getFieldKey(field, index);
    qosPayloadValues[key] = payload?.[key] ?? "";
  });
}

function resetQosEditor() {
  selectedQosSubmissionId.value = "";
  qosForm.organization_id = qosOrganizations.value[0]?.id || "";
  qosForm.reporting_period_start = "";
  qosForm.reporting_period_end = "";
  qosForm.certificate_name = "";
  qosForm.certificate_reference = "";
  qosForm.certificate_expiry_date = "";
  populateQosPayloadValues({});
}

function openQosSubmission(submission) {
  selectedQosSubmissionId.value = submission.id;
  qosForm.organization_id = submission.organization_id || "";
  qosForm.reporting_period_start = String(submission.reporting_period_start || "").slice(0, 10);
  qosForm.reporting_period_end = String(submission.reporting_period_end || "").slice(0, 10);
  qosForm.certificate_name = submission.certificate_name || "";
  qosForm.certificate_reference = submission.certificate_reference || "";
  qosForm.certificate_expiry_date = String(submission.certificate_expiry_date || "").slice(0, 10);
  populateQosPayloadValues(submission.payload || {});
}

function buildQosDraftPayload() {
  return {
    organization_id: qosForm.organization_id,
    submission_type: qosModule.value?.code || "quality_of_service_report",
    reporting_period_start: qosForm.reporting_period_start,
    reporting_period_end: qosForm.reporting_period_end,
    payload: buildDynamicPayload(qosFields.value, qosPayloadValues),
    certificate_name: qosForm.certificate_name || undefined,
    certificate_reference: qosForm.certificate_reference || undefined,
    certificate_expiry_date: qosForm.certificate_expiry_date || undefined,
  };
}

function resetSupportThreadForm() {
  supportThreadForm.subject = "";
  supportThreadForm.body = "";
  supportReplyBody.value = "";
}

function resetPaymentForm() {
  paymentForm.provider_code = paymentProviders.value[0]?.code || "";
  paymentForm.amount = selectedInvoice.value?.outstanding_amount
    ? String(selectedInvoice.value.outstanding_amount)
    : "";
  paymentForm.payer_reference = "";
  paymentForm.mno_code = "";
  paymentForm.phone_number = "";
}

function resetOrganizationForm() {
  organizationForm.name = "";
  organizationForm.registration_number = "";
  organizationForm.organization_type = "company";
  organizationForm.tax_identifier = "";
  organizationForm.contact_email = "";
  organizationForm.contact_phone = "";
  organizationForm.address = "";
  organizationForm.status = "active";
}

function startOrganizationCreate() {
  organizationFormMode.value = "create";
  selectedOrganizationId.value = "";
  resetOrganizationForm();
  resetMemberForm();
}

function populateOrganizationForm(organization) {
  organizationFormMode.value = "edit";
  organizationForm.name = organization?.name || "";
  organizationForm.registration_number = organization?.registration_number || "";
  organizationForm.organization_type = organization?.organization_type || "company";
  organizationForm.tax_identifier = organization?.tax_identifier || "";
  organizationForm.contact_email = organization?.contact_email || "";
  organizationForm.contact_phone = organization?.contact_phone || "";
  organizationForm.address = organization?.address || "";
  organizationForm.status = organization?.status || "active";
}

function selectOrganization(organizationId) {
  selectedOrganizationId.value = organizationId;
  const organization = organizations.value.find((item) => item.id === organizationId);
  if (organization) {
    populateOrganizationForm(organization);
    selectedMemberId.value = "";
    resetMemberForm();
  }
}

function resetMemberForm() {
  selectedMemberId.value = "";
  memberForm.email = "";
  memberForm.title = "";
  memberForm.membership_status = "pending";
  memberForm.is_primary_contact = false;
  memberForm.role_code = "";
}

function selectMember(member) {
  selectedMemberId.value = member.id;
  memberForm.email = member.user?.email || "";
  memberForm.title = member.title || "";
  memberForm.membership_status = member.membership_status || "pending";
  memberForm.is_primary_contact = Boolean(member.is_primary_contact);
  memberForm.role_code = "";
}

function pushSuccess(message) {
  successMessage.value = message;
}

function pushError(error, fallbackMessage) {
  pageError.value = error?.message || fallbackMessage;
}

async function loadTypeApprovalData() {
  guidelines.value = [];
  notices.value = [];
  feeStructure.value = [];
  licenseCategories.value = [];
  guidelinePage.value = 1;
  noticePage.value = 1;

  const [guidelineData, noticeData, feeData, categoryData] = await Promise.all([
    fetchPublicGuidelines(),
    fetchPublicNotices(),
    fetchPublicFeeStructure(),
    fetchPublicLicenseCategories(),
  ]);

  guidelines.value = guidelineData.map((item) => ({
    ...item,
    download_url: resolveApiUrl(item.download_url),
  }));
  notices.value = noticeData.map((item) => ({
    ...item,
    download_url: resolveApiUrl(item.download_url),
  }));
  feeStructure.value = feeData;
  licenseCategories.value = categoryData;
}

async function loadQosMetrics() {
  qosMetrics.value = await fetchDqoEnhancedMetrics(qosServiceFilter.value);
}

async function loadQosData() {
  qosSubmissions.value = [];
  qosOrganizations.value = [];
  qosPage.value = 1;

  const [moduleData, organizationData, submissionData, expiryTrackerData] = await Promise.all([
    fetchComplianceModules(),
    fetchOrganizations(),
    fetchComplianceSubmissions({ submission_type: "quality_of_service_report" }),
    fetchComplianceExpiryTracker(90),
  ]);

  qosModule.value =
    moduleData.find((item) => item.code === "quality_of_service_report") || moduleData[0] || null;
  qosOrganizations.value = organizationData;
  qosSubmissions.value = submissionData;
  qosExpiryTracker.value = expiryTrackerData;
  await loadQosMetrics();

  if (selectedQosSubmissionId.value) {
    const activeSubmission = submissionData.find((item) => item.id === selectedQosSubmissionId.value);
    if (activeSubmission) {
      openQosSubmission(activeSubmission);
      return;
    }
  }

  resetQosEditor();
}

async function loadComplaintsData() {
  const guidelineData = await fetchPublicGuidelines();
  complaintsGuide.value =
    guidelineData.find((item) => item.code === "complaints_and_appeals_guide") || null;
  if (complaintsGuide.value) {
    complaintsGuide.value = {
      ...complaintsGuide.value,
      download_url: resolveApiUrl(complaintsGuide.value.download_url),
    };
  }
}

async function loadReportsData() {
  invoices.value = [];
  payments.value = [];
  paymentProviders.value = [];
  reportsApplications.value = [];
  invoicePage.value = 1;
  paymentPage.value = 1;

  const [applicationData, invoiceData, paymentData, providerData] = await Promise.all([
    fetchApplications(),
    fetchInvoices(),
    fetchPayments(),
    fetchPaymentProviders(),
  ]);

  reportsApplications.value = sortApplications(applicationData);
  invoices.value = invoiceData;
  payments.value = paymentData;
  paymentProviders.value = providerData;

  const nextInvoiceId =
    selectedInvoiceId.value && invoiceData.some((item) => item.id === selectedInvoiceId.value)
      ? selectedInvoiceId.value
      : invoiceData.find((item) => Number(item.outstanding_amount || 0) > 0)?.id || invoiceData[0]?.id || "";

  selectedInvoiceId.value = nextInvoiceId;
  resetPaymentForm();

  if (selectedPaymentId.value && paymentData.some((item) => item.id === selectedPaymentId.value)) {
    selectedPaymentDetail.value = await fetchPayment(selectedPaymentId.value);
  } else {
    selectedPaymentId.value = "";
    selectedPaymentDetail.value = null;
  }
}

async function loadSupportThreads(applicationId) {
  if (!applicationId) {
    supportThreads.value = [];
    selectedThreadId.value = "";
    return;
  }

  supportThreadsLoading.value = true;

  try {
    const threadData = await fetchApplicationMessageThreads(applicationId);
    supportThreads.value = threadData;
    selectedThreadId.value =
      threadData.find((item) => item.id === selectedThreadId.value)?.id || threadData[0]?.id || "";
  } finally {
    supportThreadsLoading.value = false;
  }
}

async function loadSupportData() {
  supportApplications.value = [];
  supportThreads.value = [];
  supportApplicationPage.value = 1;

  const applicationData = await fetchApplications();
  supportApplications.value = sortApplications(applicationData);
  selectedSupportApplicationId.value =
    supportApplications.value.find((item) => item.id === selectedSupportApplicationId.value)?.id ||
    supportApplications.value[0]?.id ||
    "";

  await loadSupportThreads(selectedSupportApplicationId.value);
}

async function loadSettingsData() {
  organizations.value = [];
  organizationPage.value = 1;
  memberPage.value = 1;

  const organizationData = await fetchOrganizations();
  organizations.value = [...organizationData].sort((left, right) => left.name.localeCompare(right.name));

  if (selectedOrganizationId.value) {
    const activeOrganization = organizations.value.find((item) => item.id === selectedOrganizationId.value);
    if (activeOrganization) {
      populateOrganizationForm(activeOrganization);
      return;
    }
  }

  if (organizations.value.length) {
    selectOrganization(organizations.value[0].id);
    return;
  }

  startOrganizationCreate();
}

async function loadProfileData() {
  const [userData, organizationData] = await Promise.all([fetchCurrentUser(), fetchOrganizations()]);
  profileUser.value = userData;
  profileOrganizations.value = [...organizationData].sort((left, right) => left.name.localeCompare(right.name));
  updateStoredUser(userData);
  verificationMode.value =
    userData.nationality_category === "foreign_national" ? "foreign_national" : "citizen";
}

async function loadRouteData() {
  loading.value = true;
  pageError.value = "";
  successMessage.value = "";

  try {
    switch (shellKey.value) {
      case "type-approval":
        await loadTypeApprovalData();
        break;
      case "qos-monitoring":
        await loadQosData();
        break;
      case "complaints":
        await loadComplaintsData();
        break;
      case "reports":
        await loadReportsData();
        break;
      case "support":
        await loadSupportData();
        break;
      case "settings":
        await loadSettingsData();
        break;
      case "profile":
        await loadProfileData();
        break;
      default:
        break;
    }
  } catch (error) {
    pushError(error, "We couldn't load this workspace right now.");
  } finally {
    loading.value = false;
  }
}

async function saveQosDraft() {
  saving.value = true;
  pageError.value = "";
  successMessage.value = "";

  try {
    const draftPayload = buildQosDraftPayload();
    let submission = null;

    if (selectedQosSubmissionId.value) {
      submission = await updateComplianceSubmission(selectedQosSubmissionId.value, {
        reporting_period_start: draftPayload.reporting_period_start,
        reporting_period_end: draftPayload.reporting_period_end,
        payload: draftPayload.payload,
        certificate_name: draftPayload.certificate_name,
        certificate_reference: draftPayload.certificate_reference,
        certificate_expiry_date: draftPayload.certificate_expiry_date,
      });
    } else {
      submission = await createComplianceSubmission(draftPayload);
    }

    selectedQosSubmissionId.value = submission.id;
    qosSubmissions.value = upsertById(qosSubmissions.value, submission);
    openQosSubmission(submission);
    pushSuccess("QoS draft saved successfully.");
  } catch (error) {
    pushError(error, "We couldn't save the QoS draft.");
  } finally {
    saving.value = false;
  }
}

async function submitQosRecord() {
  saving.value = true;
  pageError.value = "";
  successMessage.value = "";

  try {
    let submissionId = selectedQosSubmissionId.value;
    if (!submissionId) {
      const draft = await createComplianceSubmission(buildQosDraftPayload());
      submissionId = draft.id;
      selectedQosSubmissionId.value = draft.id;
      qosSubmissions.value = upsertById(qosSubmissions.value, draft);
    }

    const submitted = await submitComplianceSubmission(submissionId, {
      payload: buildDynamicPayload(qosFields.value, qosPayloadValues),
      certificate_name: qosForm.certificate_name || undefined,
      certificate_reference: qosForm.certificate_reference || undefined,
      certificate_expiry_date: qosForm.certificate_expiry_date || undefined,
    });

    qosSubmissions.value = upsertById(qosSubmissions.value, submitted);
    openQosSubmission(submitted);
    pushSuccess("QoS record submitted to BOCRA.");
  } catch (error) {
    pushError(error, "We couldn't submit the QoS record.");
  } finally {
    saving.value = false;
  }
}

async function submitPublicServiceIntake() {
  saving.value = true;
  pageError.value = "";
  successMessage.value = "";

  try {
    if (complaintType.value !== "complaint" && !complaintForm.related_reference.trim()) {
      throw new Error("Disputes and appeals require a related reference.");
    }

    const payload = {
      contact_name: complaintForm.contact_name,
      contact_email: complaintForm.contact_email || undefined,
      contact_phone: complaintForm.contact_phone || undefined,
      organization_name: complaintForm.organization_name || undefined,
      subject: complaintForm.subject,
      description: complaintForm.description,
      related_reference: complaintForm.related_reference || undefined,
      preferred_contact_channel: complaintForm.preferred_contact_channel || undefined,
      payload: {
        issue_area: complaintForm.issue_area || undefined,
        preferred_outcome: complaintForm.preferred_outcome || undefined,
      },
    };

    const submitter =
      complaintType.value === "complaint"
        ? submitPublicComplaint
        : complaintType.value === "dispute"
          ? submitPublicDispute
          : submitPublicAppeal;

    const receipt = await submitter(payload);
    complaintReceipts.value = [receipt, ...complaintReceipts.value].slice(0, 12);
    persistStoredReceipts();
    complaintForm.subject = "";
    complaintForm.description = "";
    complaintForm.related_reference = "";
    complaintForm.issue_area = "";
    complaintForm.preferred_outcome = "";
    pushSuccess(`${publicSubmissionLabel(complaintType.value)} submitted successfully.`);
  } catch (error) {
    pushError(error, "We couldn't submit this public service intake.");
  } finally {
    saving.value = false;
  }
}

async function selectInvoice(invoiceId) {
  selectedInvoiceId.value = invoiceId;
  resetPaymentForm();
}

async function initiateSelectedInvoicePayment() {
  if (!selectedInvoice.value) {
    pageError.value = "Select an invoice first.";
    return;
  }

  saving.value = true;
  pageError.value = "";
  successMessage.value = "";

  try {
    const payment = await initiateInvoicePayment(selectedInvoice.value.id, {
      provider_code: paymentForm.provider_code,
      amount: paymentForm.amount || undefined,
      payer_reference: paymentForm.payer_reference || undefined,
      mno_code: paymentForm.mno_code || undefined,
      phone_number: paymentForm.phone_number || undefined,
    });

    selectedPaymentId.value = payment.id;
    selectedPaymentDetail.value = payment;
    await loadReportsData();
    pushSuccess("Payment initiation request sent successfully.");
  } catch (error) {
    pushError(error, "We couldn't initiate the payment.");
  } finally {
    saving.value = false;
  }
}

async function inspectPayment(paymentId) {
  saving.value = true;
  pageError.value = "";

  try {
    selectedPaymentId.value = paymentId;
    selectedPaymentDetail.value = await fetchPayment(paymentId);
  } catch (error) {
    pushError(error, "We couldn't load the payment detail.");
  } finally {
    saving.value = false;
  }
}

async function statusCheckSelectedPayment() {
  if (!selectedPaymentId.value) {
    pageError.value = "Select a payment first.";
    return;
  }

  saving.value = true;
  pageError.value = "";

  try {
    selectedPaymentDetail.value = await checkPaymentStatus(selectedPaymentId.value);
    await loadReportsData();
    pushSuccess("Payment status refreshed.");
  } catch (error) {
    pushError(error, "We couldn't refresh the payment status.");
  } finally {
    saving.value = false;
  }
}

async function selectSupportApplication(applicationId) {
  selectedSupportApplicationId.value = applicationId;
  selectedThreadId.value = "";
  resetSupportThreadForm();
  await loadSupportThreads(applicationId);
}

async function createSupportThread() {
  if (!selectedSupportApplicationId.value) {
    pageError.value = "Select an application first.";
    return;
  }

  saving.value = true;
  pageError.value = "";
  successMessage.value = "";

  try {
    const thread = await createApplicationMessageThread(selectedSupportApplicationId.value, {
      subject: supportThreadForm.subject,
      body: supportThreadForm.body,
      visibility: supportThreadForm.visibility,
    });

    supportThreads.value = upsertById(supportThreads.value, thread);
    selectedThreadId.value = thread.id;
    resetSupportThreadForm();
    pushSuccess("Support thread created.");
  } catch (error) {
    pushError(error, "We couldn't create the support thread.");
  } finally {
    saving.value = false;
  }
}

async function replySupportThread() {
  if (!selectedSupportApplicationId.value || !selectedThreadId.value) {
    pageError.value = "Select a support thread first.";
    return;
  }

  saving.value = true;
  pageError.value = "";
  successMessage.value = "";

  try {
    const thread = await replyToApplicationMessageThread(
      selectedSupportApplicationId.value,
      selectedThreadId.value,
      {
        body: supportReplyBody.value,
      },
    );

    supportThreads.value = upsertById(supportThreads.value, thread);
    supportReplyBody.value = "";
    pushSuccess("Reply sent successfully.");
  } catch (error) {
    pushError(error, "We couldn't send the reply.");
  } finally {
    saving.value = false;
  }
}

async function submitOrganizationForm() {
  saving.value = true;
  pageError.value = "";
  successMessage.value = "";

  try {
    const isCreatingOrganization = organizationFormMode.value === "create";
    let organization = null;
    const payload = {
      name: organizationForm.name,
      registration_number: organizationForm.registration_number || undefined,
      organization_type: organizationForm.organization_type,
      tax_identifier: organizationForm.tax_identifier || undefined,
      contact_email: organizationForm.contact_email || undefined,
      contact_phone: organizationForm.contact_phone || undefined,
      address: organizationForm.address || undefined,
      status: organizationForm.status || undefined,
    };

    if (isCreatingOrganization) {
      organization = await createOrganization(payload);
      selectedOrganizationId.value = organization.id;
    } else if (selectedOrganizationId.value) {
      organization = await updateOrganization(selectedOrganizationId.value, payload);
    }

    await loadSettingsData();
    if (organization?.id) {
      selectOrganization(organization.id);
    }
    pushSuccess(
      isCreatingOrganization
        ? "Organization created successfully."
        : "Organization updated successfully.",
    );
  } catch (error) {
    pushError(error, "We couldn't save the organization.");
  } finally {
    saving.value = false;
  }
}

async function submitMemberForm() {
  if (!selectedOrganizationId.value) {
    pageError.value = "Select an organization first.";
    return;
  }

  saving.value = true;
  pageError.value = "";
  successMessage.value = "";

  try {
    const isEditingMember = Boolean(selectedMemberId.value);

    if (selectedMemberId.value) {
      await updateOrganizationMember(selectedOrganizationId.value, selectedMemberId.value, {
        title: memberForm.title || undefined,
        membership_status: memberForm.membership_status || undefined,
        is_primary_contact: memberForm.is_primary_contact,
        role_code: memberForm.role_code || undefined,
      });
    } else {
      await addOrganizationMember(selectedOrganizationId.value, {
        email: memberForm.email,
        title: memberForm.title || undefined,
        membership_status: memberForm.membership_status,
        is_primary_contact: memberForm.is_primary_contact,
        role_code: memberForm.role_code || undefined,
      });
    }

    await loadSettingsData();
    if (selectedOrganizationId.value) {
      selectOrganization(selectedOrganizationId.value);
    }
    resetMemberForm();
    pushSuccess(isEditingMember ? "Member updated successfully." : "Member added successfully.");
  } catch (error) {
    pushError(error, "We couldn't save the organization member.");
  } finally {
    saving.value = false;
  }
}

async function removeSelectedMember(member) {
  if (!selectedOrganizationId.value) {
    return;
  }

  if (typeof window !== "undefined" && !window.confirm(`Remove ${member.user?.full_name || "this member"}?`)) {
    return;
  }

  saving.value = true;
  pageError.value = "";
  successMessage.value = "";

  try {
    await removeOrganizationMember(selectedOrganizationId.value, member.id);
    await loadSettingsData();
    if (selectedOrganizationId.value) {
      selectOrganization(selectedOrganizationId.value);
    }
    pushSuccess("Member removed successfully.");
  } catch (error) {
    pushError(error, "We couldn't remove the organization member.");
  } finally {
    saving.value = false;
  }
}

async function readFileAsDocument(file) {
  const encodedBody = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || "").split(",")[1] || "");
    reader.onerror = () => reject(new Error("Failed to read the selected file."));
    reader.readAsDataURL(file);
  });

  return {
    file_name: file.name,
    mime_type: file.type || "application/octet-stream",
    document_base64: encodedBody,
  };
}

async function handleCitizenDocument(fieldName, event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  try {
    citizenForm[fieldName] = await readFileAsDocument(file);
    pushSuccess(`${fieldName === "front_document" ? "Front" : "Back"} document attached.`);
  } catch (error) {
    pushError(error, "We couldn't read the selected identity document.");
  }
}

async function handleForeignDocument(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  try {
    foreignForm.document = await readFileAsDocument(file);
    pushSuccess("Passport document attached.");
  } catch (error) {
    pushError(error, "We couldn't read the selected passport document.");
  }
}

async function submitCitizenVerification() {
  verifyingIdentity.value = true;
  pageError.value = "";
  successMessage.value = "";

  try {
    const response = await verifyCitizenIdentity({
      national_id_number: citizenForm.national_id_number,
      front_document: citizenForm.front_document,
      back_document: citizenForm.back_document,
    });

    profileUser.value = response.user;
    updateStoredUser(response.user);
    pushSuccess(response.message);
  } catch (error) {
    pushError(error, "We couldn't verify the citizen profile.");
  } finally {
    verifyingIdentity.value = false;
  }
}

async function submitForeignVerification() {
  verifyingIdentity.value = true;
  pageError.value = "";
  successMessage.value = "";

  try {
    const response = await verifyForeignNationalIdentity({
      passport_number: foreignForm.passport_number,
      ...(foreignForm.document || {}),
    });

    profileUser.value = response.user;
    updateStoredUser(response.user);
    pushSuccess(response.message);
  } catch (error) {
    pushError(error, "We couldn't verify the foreign-national profile.");
  } finally {
    verifyingIdentity.value = false;
  }
}
</script>

<style scoped>
.workspace-page__success {
  margin: 0;
  padding: 0.95rem 1rem;
  border-radius: 1rem;
  background: rgba(15, 118, 110, 0.1);
  color: #0f766e;
  font-weight: 600;
}

.workspace-page__grid {
  display: grid;
  gap: 1.25rem;
}

.workspace-page__grid--balanced {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.workspace-page__category-stack,
.workspace-page__organization-list,
.workspace-page__thread-list,
.workspace-page__message-stack,
.workspace-page__expiry-stack,
.workspace-page__monitor-stack {
  display: grid;
  gap: 0.9rem;
}

.workspace-page__fee-grid,
.workspace-page__profile-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.workspace-page__fee-card,
.workspace-page__monitor-card,
.workspace-page__invoice-summary,
.workspace-page__payment-detail,
.workspace-page__guide-box {
  display: grid;
  gap: 0.55rem;
}

.workspace-page__fee-block {
  display: grid;
  gap: 0.5rem;
  padding-top: 0.75rem;
  margin-top: 0.75rem;
  border-top: 1px solid rgba(148, 163, 184, 0.18);
}

.workspace-page__fee-block p,
.workspace-page__organization-item p,
.workspace-page__thread-item p,
.workspace-page__message-card p {
  margin: 0;
  color: var(--auth-muted);
}

.workspace-page__mini-list {
  display: grid;
  gap: 0.55rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.workspace-page__mini-list li {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  color: var(--auth-text);
}

.workspace-page__monitor-card strong,
.workspace-page__category-stack strong,
.workspace-page__organization-item strong,
.workspace-page__thread-item strong,
.workspace-page__message-card strong {
  color: var(--auth-text);
}

.workspace-page__pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
}

.workspace-page__link-button {
  display: inline-flex;
  color: var(--auth-primary);
  font-weight: 600;
  text-decoration: none;
}

.workspace-page__link-button:hover {
  text-decoration: underline;
}

.workspace-page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  align-items: center;
}

.workspace-page__filter-row {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 1rem;
}

.workspace-page__filter-select {
  max-width: 220px;
}

.workspace-page__table-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  align-items: center;
}

.workspace-page__thread-item,
.workspace-page__organization-item {
  display: grid;
  gap: 0.45rem;
  padding: 1rem;
  text-align: left;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 1rem;
  background: rgba(248, 250, 252, 0.78);
  cursor: pointer;
}

.workspace-page__thread-item.is-active,
.workspace-page__organization-item.is-active {
  border-color: rgba(15, 118, 110, 0.32);
  box-shadow: 0 12px 28px rgba(15, 118, 110, 0.08);
}

.workspace-page__thread-item span,
.workspace-page__organization-item span,
.workspace-page__message-card span {
  color: var(--auth-muted);
  font-size: 0.82rem;
}

.workspace-page__thread-form,
.workspace-page__member-form {
  margin-top: 1rem;
}

.workspace-page__message-card {
  display: grid;
  gap: 0.45rem;
  padding: 1rem;
  border-radius: 1rem;
  background: rgba(248, 250, 252, 0.82);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.workspace-page__message-card.is-applicant {
  background: rgba(15, 118, 110, 0.08);
  border-color: rgba(15, 118, 110, 0.16);
}

.workspace-page__attention-list {
  margin-top: 1rem;
}

.workspace-page__attention-list strong {
  display: block;
  margin-bottom: 0.75rem;
}

.workspace-page__checkbox {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  color: var(--auth-text);
  font-weight: 500;
}

.workspace-page__checkbox input {
  width: 1rem;
  height: 1rem;
}

@media (max-width: 1100px) {
  .workspace-page__grid--balanced {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 780px) {
  .workspace-page__pagination,
  .workspace-page__filter-row,
  .workspace-page__actions,
  .workspace-page__table-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

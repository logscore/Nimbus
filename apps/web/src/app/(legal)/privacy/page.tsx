import {
	LegalHeading1,
	LegalHeading2,
	LegalHeading3,
	LegalParagraph,
	LegalTextLink,
} from "@/components/landing-page/legal/text";
import { COMPANY_NAME, CONTACT_EMAIL, LEGAL_UPDATE_DATE, URL, WEBSITE_NAME } from "@nimbus/shared";
import { Card, CardContent } from "@/components/ui/card";
import type { Metadata } from "next";

// this is a copy of Analogs privacy component with some changes
// https://github.com/analogdotnow/Analog/blob/main/apps/web/src/app/(legal)/privacy/page.tsx

export const metadata: Metadata = {
	title: "Privacy Policy - Nimbus",
};

export default function PrivacyPage() {
	return (
		<main className="relative">
			<div className="relative container mx-auto px-4 py-16">
				<div className="mx-auto max-w-4xl">
					<div className="mb-10 text-center">
						<LegalHeading1>Privacy Policy</LegalHeading1>
					</div>
					<Card className="border-muted/30 bg-background/80 border-2 shadow-none">
						<CardContent className="space-y-8 p-8 text-base leading-relaxed">
							<LegalParagraph>
								Your privacy is important to us. It is {COMPANY_NAME}&apos;s policy to respect your privacy and comply
								with any applicable law and regulation regarding any personal information we may collect about you,
								including across our website, <LegalTextLink href={URL}>{URL}</LegalTextLink>, and other sites we own
								and operate.
							</LegalParagraph>

							<LegalParagraph>
								Personal information is any information about you which can be used to identify you. This includes
								information about you as a person (such as name, address, and date of birth), your devices, payment
								details, and even information about how you use a website or online service.
							</LegalParagraph>

							<LegalParagraph>
								In the event our site contains links to third-party sites and services, please be aware that those sites
								and services have their own privacy policies. After following a link to any third-party content, you
								should read their posted privacy policy information about how they collect and use personal information.
								This Privacy Policy does not apply to any of your activities after you leave our site.
							</LegalParagraph>

							<LegalParagraph>This policy is effective as of {LEGAL_UPDATE_DATE}</LegalParagraph>

							<LegalParagraph>Last updated: {LEGAL_UPDATE_DATE}</LegalParagraph>

							<section>
								<LegalHeading2>Information We Collect</LegalHeading2>
								<LegalParagraph>
									Information we collect falls into one of two categories: &quot;voluntarily provided&quot; information
									and &quot;automatically collected&quot; information.
								</LegalParagraph>
								<LegalParagraph>
									&quot;Voluntarily provided&quot; information refers to any information you knowingly and actively
									provide us when using or participating in any of our services and promotions.
								</LegalParagraph>
								<LegalParagraph>
									&quot;Automatically collected&quot; information refers to any information automatically sent by your
									devices in the course of accessing our products and services.
								</LegalParagraph>

								<LegalHeading3>Log Data</LegalHeading3>
								<LegalParagraph>
									When you visit our website, our servers may automatically log the standard data provided by your web
									browser. It may include your device&apos;s Internet Protocol (IP) address, your browser type and
									version, the pages you visit, the time and date of your visit, the time spent on each page, and other
									details about your visit.
								</LegalParagraph>
								<LegalParagraph>
									Additionally, if you encounter certain errors while using the site, we may automatically collect data
									about the error and the circumstances surrounding its occurrence. This data may include technical
									details about your device, what you were trying to do when the error happened, and other technical
									information relating to the problem. You may or may not receive notice of such errors, even in the
									moment they occur, that they have occurred, or what the nature of the error is.
								</LegalParagraph>
								<LegalParagraph>
									Please be aware that while this information may not be personally identifying by itself, it may be
									possible to combine it with other data to personally identify individual persons.
								</LegalParagraph>

								<LegalHeading3>Device Data</LegalHeading3>
								<LegalParagraph>
									When you visit our website or interact with our services, we may automatically collect data about your
									device, such as:
								</LegalParagraph>
								<ul className="mb-4 list-disc space-y-2 pl-6">
									<li>Device Type</li>
									<li>Operating system</li>
									<li>Device settings</li>
									<li>Geo-location data</li>
								</ul>
								<LegalParagraph>
									Data we collect can depend on the individual settings of your device and software. We recommend
									checking the policies of your device manufacturer or software provider to learn what information they
									make available to us.
								</LegalParagraph>

								<LegalHeading3>Personal Information</LegalHeading3>
								<LegalParagraph>
									We may ask for personal information - for example, when you submit content to us, when you register an
									account or when you contact us — which may include one or more of the following:
								</LegalParagraph>
								<ul className="mb-4 list-disc space-y-2 pl-6">
									<li>Name</li>
									<li>Email</li>
								</ul>
							</section>

							<section>
								<LegalHeading2>Legitimate Reasons for Processing Your Personal Information</LegalHeading2>
								<LegalParagraph>
									We only collect and use your personal information when we have a legitimate reason for doing so. In
									which instance, we only collect personal information that is reasonably necessary to provide our
									services to you.
								</LegalParagraph>
							</section>

							<section>
								<LegalHeading2>Collection and Use of Information</LegalHeading2>
								<LegalParagraph>
									We may collect personal information from you when you do any of the following on our website:
								</LegalParagraph>
								<ul className="mb-4 list-disc space-y-2 pl-6">
									<li>Register for an account</li>
									<li>Use a mobile device or web browser to access our content</li>
									<li>Contact us via email, social media, or on any similar technologies</li>
									<li>When you mention us on social media</li>
								</ul>
								<LegalParagraph>
									We may collect, hold, use, and disclose information for the following purposes, and personal
									information will not be further processed in a manner that is incompatible with these purposes:
								</LegalParagraph>
								<ul className="mb-4 list-disc space-y-2 pl-6">
									<li>to provide you with our platform&apos;s core features and services</li>
									<li>to enable you to customise or personalise your experience of our website</li>
									<li>to contact and communicate with you</li>
									<li>
										to enable you to access and use our website, associated applications, and associated social media
										platforms
									</li>
									<li>for internal record keeping and administrative purposes</li>
									<li>to comply with our legal obligations and resolve any disputes that we may have</li>
									<li>
										for security and fraud prevention, and to ensure that our sites and apps are safe, secure, and used
										in line with our terms of use
									</li>
									<li>
										for technical assessment, including to operate and improve our app, associated applications, and
										associated social media platforms
									</li>
								</ul>
								<LegalParagraph>
									We may combine voluntarily provided and automatically collected personal information with general
									information or research data we receive from other trusted sources. For example, Our marketing and
									market research activities may uncover data and insights, which we may combine with information about
									how visitors use our site to improve our site and your experience on it.
								</LegalParagraph>
							</section>

							<section>
								<LegalHeading2>Security of Your Personal Information</LegalHeading2>
								<LegalParagraph>
									When we collect and process personal information, and while we retain this information, we will
									protect it within commercially acceptable means to prevent loss and theft, as well as unauthorised
									access, disclosure, copying, use or modification.
								</LegalParagraph>
								<LegalParagraph>
									Although we will do our best to protect the personal information you provide to us, we advise that no
									method of electronic transmission or storage is 100% secure and no one can guarantee absolute data
									security.
								</LegalParagraph>
								<LegalParagraph>
									You are responsible for selecting any password and its overall security strength, ensuring the
									security of your own information within the bounds of our services. For example, ensuring any
									passwords associated with accessing your personal information and accounts are secure and
									confidential.
								</LegalParagraph>
							</section>

							<section>
								<LegalHeading2>How Long We Keep Your Personal Information</LegalHeading2>
								<LegalParagraph>
									We keep your personal information only for as long as we need to. This time period may depend on what
									we are using your information for, in accordance with this privacy policy. For example, if you have
									provided us with personal information as part of creating an account with us, we may retain this
									information for the duration your account exists on our system. If your personal information is no
									longer required for this purpose, we will delete it or make it anonymous by removing all details that
									identify you.
								</LegalParagraph>
								<LegalParagraph>
									However, if necessary, we may retain your personal information for our compliance with a legal,
									accounting, or reporting obligation or for archiving purposes in the public interest, scientific, or
									historical research purposes or statistical purposes.
								</LegalParagraph>
							</section>

							<section>
								<LegalHeading2>Children&apos;s Privacy</LegalHeading2>
								<LegalParagraph>
									We do not aim any of our products or services directly at children under the age of 13 and we do not
									knowingly collect personal information about children under 13.
								</LegalParagraph>
							</section>

							<section>
								<LegalHeading2>Disclosure of Personal Information to Third Parties</LegalHeading2>
								<LegalParagraph>We may disclose personal information to:</LegalParagraph>
								<ul className="mb-4 list-disc space-y-2 pl-6">
									<li>a parent, subsidiary or affiliate of our company</li>
									<li>
										third-party service providers for the purpose of enabling them to provide their services, including
										(without limitation) IT service providers, data storage, hosting and server providers, error
										loggers, debt collectors, maintenance or problem-solving providers, marketing providers,
										professional advisors, and payment systems operators
									</li>
									<li>our employees, contractors, and/or related entities</li>
									<li>our existing or potential agents or business partners</li>
									<li>
										credit reporting agencies, courts, tribunals, and regulatory authorities, in the event you fail to
										pay for goods or services we have provided to you
									</li>
									<li>
										courts, tribunals, regulatory authorities, and law enforcement officers, as required by law, in
										connection with any actual or prospective legal proceedings, or in order to establish, exercise, or
										defend our legal rights
									</li>
									<li>
										third parties, including agents or sub-contractors who assist us in providing information, products,
										services, or direct marketing to you
									</li>
									<li>third parties to collect and process data</li>
									<li>
										an entity that buys, or to which we transfer all or substantially all of our assets and business
									</li>
								</ul>
								<LegalParagraph>Third parties we currently use include:</LegalParagraph>
								<ul className="mb-4 list-disc space-y-2 pl-6">
									<li>Resend</li>
									<li>Vercel</li>
									<li>Supabase</li>
									<li>Sentry</li>
								</ul>
							</section>

							<section>
								<LegalHeading2>International Transfers of Personal Information</LegalHeading2>
								<LegalParagraph>
									The personal information we collect is stored and/or processed in Germany, Ireland, Netherlands (the),
									United States of America (the) or where we or our partners, affiliates, and third-party providers
									maintain facilities.
								</LegalParagraph>
								<LegalParagraph>
									The countries to which we store, process, or transfer your personal information may not have the same
									data protection laws as the country in which you initially provided the information. If we transfer
									your personal information to third parties in other countries: (i) we will perform those transfers in
									accordance with the requirements of applicable law; and (ii) we will protect the transferred personal
									information in accordance with this privacy policy.
								</LegalParagraph>
							</section>

							<section>
								<LegalHeading2>Your Rights and Controlling Your Personal Information</LegalHeading2>
								<LegalParagraph>
									<strong>Your choice:</strong> By providing personal information to us, you understand we will collect,
									hold, use, and disclose your personal information in accordance with this privacy policy. You do not
									have to provide personal information to us, however, if you do not, it may affect your use of our
									website or the products and/or services offered on or through it.
								</LegalParagraph>
								<LegalParagraph>
									<strong>Information from third parties:</strong> If we receive personal information about you from a
									third party, we will protect it as set out in this privacy policy. If you are a third party providing
									personal information about somebody else, you represent and warrant that you have such person&apos;s
									consent to provide the personal information to us.
								</LegalParagraph>
								<LegalParagraph>
									<strong>Marketing permission:</strong> If you have previously agreed to us using your personal
									information for direct marketing purposes, you may change your mind at any time by contacting us using
									the details below.
								</LegalParagraph>
								<LegalParagraph>
									<strong>Access:</strong> You may request details of the personal information that we hold about you.
								</LegalParagraph>
								<LegalParagraph>
									<strong>Correction:</strong> If you believe that any information we hold about you is inaccurate, out
									of date, incomplete, irrelevant, or misleading, please contact us using the details provided in this
									privacy policy. We will take reasonable steps to correct any information found to be inaccurate,
									incomplete, misleading, or out of date.
								</LegalParagraph>
								<LegalParagraph>
									<strong>Non-discrimination:</strong> We will not discriminate against you for exercising any of your
									rights over your personal information. Unless your personal information is required to provide you
									with a particular service or offer (for example providing user support), we will not deny you goods or
									services and/or charge you different prices or rates for goods or services, including through granting
									discounts or other benefits, or imposing penalties, or provide you with a different level or quality
									of goods or services.
								</LegalParagraph>
								<LegalParagraph>
									<strong>Downloading of Personal Information:</strong> We provide a means for you to download the
									personal information you have shared through our site. Please contact us for more information.
								</LegalParagraph>
								<LegalParagraph>
									<strong>Notification of data breaches:</strong> We will comply with laws applicable to us in respect
									of any data breach.
								</LegalParagraph>
								<LegalParagraph>
									<strong>Complaints:</strong> If you believe that we have breached a relevant data protection law and
									wish to make a complaint, please contact us using the details below and provide us with full details
									of the alleged breach. We will promptly investigate your complaint and respond to you, in writing,
									setting out the outcome of our investigation and the steps we will take to deal with your complaint.
									You also have the right to contact a regulatory body or data protection authority in relation to your
									complaint.
								</LegalParagraph>
								<LegalParagraph>
									<strong>Unsubscribe:</strong> To unsubscribe from our email database or opt-out of communications
									(including marketing communications), please contact us using the details provided in this privacy
									policy, or opt-out using the opt-out facilities provided in the communication. We may need to request
									specific information from you to help us confirm your identity.
								</LegalParagraph>
							</section>

							<section>
								<LegalHeading2>Business Transfers</LegalHeading2>
								<LegalParagraph>
									If we or our assets are acquired, or in the unlikely event that we go out of business or enter
									bankruptcy, we would include data, including your personal information, among the assets transferred
									to any parties who acquire us. You acknowledge that such transfers may occur, and that any parties who
									acquire us may, to the extent permitted by applicable law, continue to use your personal information
									according to this policy, which they will be required to assume as it is the basis for any ownership
									or use rights we have over such information.
								</LegalParagraph>
							</section>

							<section>
								<LegalHeading2>Limits of Our Policy</LegalHeading2>
								<LegalParagraph>
									Our website may link to external sites that are not operated by us. Please be aware that we have no
									control over the content and policies of those sites, and cannot accept responsibility or liability
									for their respective privacy practices.
								</LegalParagraph>
							</section>

							<section>
								<LegalHeading2>Changes to This Policy</LegalHeading2>
								<LegalParagraph>
									At our discretion, we may change our privacy policy to reflect updates to our business processes,
									current acceptable practices, or legislative or regulatory changes. If we decide to change this
									privacy policy, we will post the changes here at the same link by which you are accessing this privacy
									policy.
								</LegalParagraph>
								<LegalParagraph>
									If the changes are significant, or if required by applicable law, we will contact you (based on your
									selected preferences for communications from us) and all our registered users with the new details and
									links to the updated or changed policy.
								</LegalParagraph>
								<LegalParagraph>
									If required by law, we will get your permission or give you the opportunity to opt in to or opt out
									of, as applicable, any new uses of your personal information.
								</LegalParagraph>
							</section>

							<section>
								<LegalHeading2>Additional Disclosures for U.S. States Privacy Law Compliance.</LegalHeading2>
								<LegalParagraph>
									The following section includes provisions that comply with the privacy laws of these states
									(California, Colorado, Delaware, Florida, Virginia, and Utah) and is applicable only to the residents
									of those states. Specific references to a particular state (in a heading or in the text) are only a
									reference to that state&apos;s law and applies only to that state&apos;s residents. Non-state specific
									language applies to all of the states listed above.
								</LegalParagraph>

								<LegalHeading3>Do Not Track</LegalHeading3>
								<LegalParagraph>
									Some browsers have a &quot;Do Not Track&quot; feature that lets you tell websites that you do not want
									to have your online activities tracked. At this time, we do not respond to browser &quot;Do Not
									Track&quot; signals.
								</LegalParagraph>
								<LegalParagraph>
									We adhere to the standards outlined in this privacy policy, ensuring we collect and process personal
									information lawfully, fairly, transparently, and with legitimate, legal reasons for doing so.
								</LegalParagraph>

								<LegalHeading3>California Privacy Laws - CPPA</LegalHeading3>
								<LegalParagraph>
									Under California Civil Code Section 1798.83, if you live in California and your business relationship
									with us is mainly for personal, family, or household purposes, you may ask us about the information we
									release to other organizations for their marketing purposes. In accordance with your right to
									non-discrimination, we may offer you certain financial incentives permitted by the California Consumer
									Privacy Act, and the California Privacy Rights Act (collectively, CCPA) that can result in different
									prices, rates, or quality levels for the goods or services we provide. Any CCPA-permitted financial
									incentive we offer will reasonably relate to the value of your personal information, and we will
									provide written terms that describe clearly the nature of such an offer. Participation in a financial
									incentive program requires your prior opt-in consent, which you may revoke at any time.
								</LegalParagraph>
								<LegalParagraph>
									Under California Civil Code Section 1798.83, if you live in California and your business relationship
									with us is mainly for personal, family, or household purposes, you may ask us about the information we
									release to other organizations for their marketing purposes. To make such a request, please contact us
									using the details provided in this privacy policy with &quot;Request for California privacy
									information&quot; in the subject line. You may make this type of request once every calendar year. We
									will email you a list of categories of personal information we revealed to other organisations for
									their marketing purposes in the last calendar year, along with their names and addresses. Not all
									personal information shared in this way is covered by Section 1798.83 of the California Civil Code.
								</LegalParagraph>

								<LegalHeading3>California Notice of Collection</LegalHeading3>
								<LegalParagraph>
									In the past 12 months, we have collected the following categories of personal information enumerated
									in the CCPA:
								</LegalParagraph>
								<ul className="mb-4 list-disc space-y-2 pl-6">
									<li>
										Identifiers, such as name, email address, phone number, account name, IP address, and an ID or
										number assigned to your account.
									</li>
								</ul>
								<LegalParagraph>
									For more information on information we collect, including the sources we receive information
									from,&quot; review the &quot;Information We Collect&quot; section. We collect and use these categories
									of personal information for the business purposes described in the &quot;Collection and Use of
									Information&quot; section, including to provide and manage our Service.
								</LegalParagraph>

								<LegalHeading3>Right to Know and Delete</LegalHeading3>
								<LegalParagraph>
									You have rights to delete your personal information we collected and know certain information about
									our data practices in the preceding 12 months. In particular, you have the right to request the
									following from us:
								</LegalParagraph>
								<ul className="mb-4 list-disc space-y-2 pl-6">
									<li>The categories of personal information we have collected about you;</li>
									<li>The categories of sources from which the personal information was collected;</li>
									<li>The categories of personal information about you we disclosed for a business purpose or sold;</li>
									<li>
										The categories of third parties to whom the personal information was disclosed for a business
										purpose or sold;
									</li>
									<li>The business or commercial purpose for collecting or selling the personal information; and</li>
									<li>The specific pieces of personal information we have collected about you.</li>
								</ul>
								<LegalParagraph>
									To exercise any of these rights, please contact us using the details provided in this privacy policy.
								</LegalParagraph>

								<LegalHeading3>Shine the Light</LegalHeading3>
								<LegalParagraph>
									In addition to the rights discussed above, you have the right to request information from us regarding
									the manner in which we share certain personal information as defined by applicable statute with third
									parties and affiliates for their own direct marketing purposes.
								</LegalParagraph>
								<LegalParagraph>
									To receive this information, send us a request using the contact details provided in this privacy
									policy. Requests must include &quot;Privacy Rights Request&quot; in the first line of the description
									and include your name, street address, city, state, and ZIP code.
								</LegalParagraph>
							</section>

							<section>
								<LegalHeading2>
									Additional Disclosures for General Data Protection Regulation (GDPR) Compliance (EU)
								</LegalHeading2>

								<LegalHeading3>Data Controller / Data Processor</LegalHeading3>
								<LegalParagraph>
									The GDPR distinguishes between organizations that process personal information for their own purposes
									(known as &quot;data controllers&quot;) and organizations that process personal information on behalf
									of other organizations (known as &quot;data processors&quot;). We, {COMPANY_NAME}, located at the
									address provided in our Contact Us section, are a Data Controller with respect to the personal
									information you provide to us.
								</LegalParagraph>

								<LegalHeading3>Legal Bases for Processing Your Personal Information</LegalHeading3>
								<LegalParagraph>
									We will only collect and use your personal information when we have a legal right to do so. In which
									case, we will collect and use your personal information lawfully, fairly, and in a transparent manner.
									If we seek your consent to process your personal information, and you are under 16 years of age, we
									will seek your parent or legal guardian&apos;s consent to process your personal information for that
									specific purpose.
								</LegalParagraph>
								<LegalParagraph>
									Our lawful bases depend on the services you use and how you use them. This means we only collect and
									use your information on the following grounds:
								</LegalParagraph>

								<LegalHeading3>Consent From You</LegalHeading3>
								<LegalParagraph>
									Where you give us consent to collect and use your personal information for a specific purpose. You may
									withdraw your consent at any time using the facilities we provide; however this will not affect any
									use of your information that has already taken place. You may consent to providing your email address
									for the purpose of receiving marketing emails from us. While you may unsubscribe at any time, we
									cannot recall any email we have already sent. If you have any further enquiries about how to withdraw
									your consent, please feel free to enquire using the details provided in the Contact Us section of this
									privacy policy.
								</LegalParagraph>

								<LegalHeading3>Performance of a Contract or Transaction</LegalHeading3>
								<LegalParagraph>
									Where you have entered into a contract or transaction with us, or in order to take preparatory steps
									prior to our entering into a contract or transaction with you. For example, if you contact us with an
									enquiry, we may require personal information such as your name and contact details in order to
									respond.
								</LegalParagraph>

								<LegalHeading3>Our Legitimate Interests</LegalHeading3>
								<LegalParagraph>
									Where we assess it is necessary for our legitimate interests, such as for us to provide, operate,
									improve and communicate our services. We consider our legitimate interests to include research and
									development, understanding our audience, marketing and promoting our services, measures taken to
									operate our services efficiently, marketing analysis, and measures taken to protect our legal rights
									and interests.
								</LegalParagraph>

								<LegalHeading3>Compliance With the Law</LegalHeading3>
								<LegalParagraph>
									In some cases, we may have a legal obligation to use or keep your personal information. Such cases may
									include (but are not limited to) court orders, criminal investigations, government requests, and
									regulatory obligations. If you have any further enquiries about how we retain personal information in
									order to comply with the law, please feel free to enquire using the details provided in the Contact Us
									section of this privacy policy.
								</LegalParagraph>

								<LegalHeading3>International Transfers Outside of the European Economic Area (EEA)</LegalHeading3>
								<LegalParagraph>
									We will ensure that any transfer of personal information from countries in the European Economic Area
									(EEA) to countries outside the EEA will be protected by appropriate safeguards, for example by using
									standard data protection clauses approved by the European Commission, or the use of binding corporate
									rules or other legally accepted means.
								</LegalParagraph>

								<LegalHeading3>Your Rights and Controlling Your Personal Information</LegalHeading3>
								<LegalParagraph>
									<strong>Restrict:</strong> You have the right to request that we restrict the processing of your
									personal information if:
								</LegalParagraph>
								<ol className="mb-4 list-decimal space-y-2 pl-6">
									<li>you are concerned about the accuracy of your personal information;</li>
									<li>you believe your personal information has been unlawfully processed;</li>
									<li>you need us to maintain the personal information solely for the purpose of a legal claim; or</li>
									<li>
										we are in the process of considering your objection in relation to processing on the basis of
										legitimate interests.
									</li>
								</ol>
								<LegalParagraph>
									<strong>Objecting to processing:</strong> You have the right to object to processing of your personal
									information that is based on our legitimate interests or public interest. If this is done, we must
									provide compelling legitimate grounds for the processing which overrides your interests, rights, and
									freedoms, in order to proceed with the processing of your personal information.
								</LegalParagraph>
								<LegalParagraph>
									<strong>Data portability:</strong> You may have the right to request a copy of the personal
									information we hold about you. Where possible, we will provide this information in CSV format or other
									easily readable machine format. You may also have the right to request that we transfer this personal
									information to a third party.
								</LegalParagraph>
								<LegalParagraph>
									<strong>Deletion:</strong> You may have a right to request that we delete the personal information we
									hold about you at any time, and we will take reasonable steps to delete your personal information from
									our current records. If you ask us to delete your personal information, we will let you know how the
									deletion affects your use of our website or products and services. There may be exceptions to this
									right for specific legal reasons which, if applicable, we will set out for you in response to your
									request. If you terminate or delete your account, we will delete your personal information within 30
									days of the deletion of your account. Please be aware that search engines and similar third parties
									may still retain copies of your personal information that has been made public at least once, like
									certain profile information and public comments, even after you have deleted the information from our
									services or deactivated your account.
								</LegalParagraph>
							</section>

							{/* {UKGDPRCompliance()} */}

							<section>
								<LegalHeading2>Contact Us</LegalHeading2>
								<LegalParagraph>
									For any questions or concerns regarding your privacy, you may contact us using the following details:
								</LegalParagraph>
								<LegalParagraph>
									{WEBSITE_NAME} - {COMPANY_NAME}
									<br />
									<LegalTextLink href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</LegalTextLink>
								</LegalParagraph>
							</section>
						</CardContent>
					</Card>
				</div>
			</div>
		</main>
	);
}

// function UKGDPRCompliance() {
// 	return (
// 		<section>
// 			<LegalHeading2>
// 				Additional Disclosures for UK General Data Protection Regulation (UK GDPR) Compliance (UK)
// 			</LegalHeading2>

// 			<LegalHeading3>Data Controller / Data Processor</LegalHeading3>
// 			<LegalParagraph>
// 				The GDPR distinguishes between organizations that process personal information for their own purposes (known as
// 				&quot;data controllers&quot;) and organizations that process personal information on behalf of other
// 				organizations (known as &quot;data processors&quot;). We, {COMPANY_NAME}, located at the address provided in our
// 				Contact Us section, are a Data Controller with respect to the personal information you provide to us.
// 			</LegalParagraph>

// 			<LegalHeading3>Third-Party Provided Content</LegalHeading3>
// 			<LegalParagraph>
// 				We may indirectly collect personal information about you from third-parties who have your permission to share
// 				it. For example, if you purchase a product or service from a business working with us, and give your permission
// 				for us to use your details in order to complete the transaction.
// 			</LegalParagraph>
// 			<LegalParagraph>
// 				We may also collect publicly available information about you, such as from any social media and messaging
// 				platforms you may use. The availability of this information will depend on both the privacy policies and your
// 				own privacy settings on such platforms.
// 			</LegalParagraph>

// 			<LegalHeading3>Additional Disclosure for Collection and Use of Personal Information</LegalHeading3>
// 			<LegalParagraph>
// 				In addition to the aforementioned purposes warranting the collection and use of personal information, we may
// 				also conduct marketing and market research activities, including how visitors use our site, website improvement
// 				opportunities and user experience.
// 			</LegalParagraph>

// 			<LegalHeading3>Personal Information No Longer Required for Our Purposes</LegalHeading3>
// 			<LegalParagraph>
// 				If your personal information is no longer required for our stated purposes, or if you instruct us under your
// 				Data Subject Rights, we will delete it or make it anonymous by removing all details that identify you
// 				(&quot;Anonymisation&quot;). However, if necessary, we may retain your personal information for our compliance
// 				with a legal, accounting, or reporting obligation or for archiving purposes in the public interest, scientific,
// 				or historical research purposes or statistical purposes.
// 			</LegalParagraph>

// 			<LegalHeading3>Legal Bases for Processing Your Personal Information</LegalHeading3>
// 			<LegalParagraph>
// 				Data Protection and Privacy Laws permit us to collect and use your personal data on a limited number of
// 				grounds.. In which case, we will collect and use your personal information lawfully, fairly and in a transparent
// 				manner. We never directly market to any person(s) under 18 years of age.
// 			</LegalParagraph>
// 			<LegalParagraph>
// 				Our lawful bases depend on the services you use and how you use them. This is a non-exhaustive list of the
// 				lawful bases we use:
// 			</LegalParagraph>

// 			<LegalHeading3>Consent From You</LegalHeading3>
// 			<LegalParagraph>
// 				Where you give us consent to collect and use your personal information for a specific purpose. You may withdraw
// 				your consent at any time using the facilities we provide; however this will not affect any use of your
// 				information that has already taken place. When you contact us, we assume your consent based on your positive
// 				action of contact, therefore you consent to your name and email address being used so we can respond to your
// 				enquiry.
// 			</LegalParagraph>
// 			<LegalParagraph>
// 				Where you agree to receive marketing communications from us, we will do so based solely on your indication of
// 				consent or until you instruct us not to, which you can do at any time.
// 			</LegalParagraph>
// 			<LegalParagraph>
// 				While you may request that we delete your contact details at any time, we cannot recall any email we have
// 				already sent. If you have any further enquiries about how to withdraw your consent, please feel free to enquire
// 				using the details provided in the Contact Us section of this privacy policy.
// 			</LegalParagraph>

// 			<LegalHeading3>Performance of a Contract or Transaction</LegalHeading3>
// 			<LegalParagraph>
// 				Where you have entered into a contract or transaction with us, or in order to take preparatory steps prior to
// 				our entering into a contract or transaction with you. For example, if you contact us with an enquiry, we may
// 				require personal information such as your name and contact details in order to respond.
// 			</LegalParagraph>

// 			<LegalHeading3>Our Legitimate Interests</LegalHeading3>
// 			<LegalParagraph>
// 				Where we assess it is necessary for our legitimate interests, such as for us to provide, operate, improve and
// 				communicate our services. We consider our legitimate interests to include research and development,
// 				understanding our audience, marketing and promoting our services, measures taken to operate our services
// 				efficiently, marketing analysis, and measures taken to protect our legal rights and interests.
// 			</LegalParagraph>

// 			<LegalHeading3>Compliance With the Law</LegalHeading3>
// 			<LegalParagraph>
// 				In some cases, we may have a legal obligation to use or keep your personal information. Such cases may include
// 				(but are not limited to) court orders, criminal investigations, government requests, and regulatory obligations.
// 				For example, we are required to keep financial records for a period of 7 years. If you have any further
// 				enquiries about how we retain personal information in order to comply with the law, please feel free to enquire
// 				using the details provided in the Contact Us section of this privacy policy.
// 			</LegalParagraph>

// 			<LegalHeading3>International Transfers of Personal Information</LegalHeading3>
// 			<LegalParagraph>
// 				The personal information we collect is stored and/or processed in the United Kingdom by us. Following an
// 				adequacy decision by the EU Commission, the UK has been granted an essentially equivalent level of protection to
// 				that guaranteed under UK GDPR.
// 			</LegalParagraph>
// 			<LegalParagraph>
// 				On some occasions, where we share your data with third parties, they may be based outside of the UK, or the
// 				European Economic Area (&quot;EEA&quot;). These countries to which we store, process, or transfer your personal
// 				information may not have the same data protection laws as the country in which you initially provided the
// 				information.
// 			</LegalParagraph>
// 			<LegalParagraph>If we transfer your personal information to third parties in other countries:</LegalParagraph>
// 			<ul className="mb-4 list-disc space-y-2 pl-6">
// 				<li>
// 					we will perform those transfers in accordance with the requirements of the UK GDPR (Article 45) and Data
// 					Protection Act 2018;
// 				</li>
// 				<li>
// 					we will adopt appropriate safeguards for protecting the transferred data, including in transit, such as
// 					standard contractual clauses (&quot;SCCs&quot;) or binding corporate rules.
// 				</li>
// 			</ul>

// 			<LegalHeading3>Your Data Subject Rights</LegalHeading3>
// 			<LegalParagraph>
// 				<strong>Right to Restrict Processing:</strong> You have the right to request that we restrict the processing of
// 				your personal information if (i) you are concerned about the accuracy of your personal information; (ii) you
// 				believe your personal information has been unlawfully processed; (iii) you need us to maintain the personal
// 				information solely for the purpose of a legal claim; or (iv) we are in the process of considering your objection
// 				in relation to processing on the basis of legitimate interests.
// 			</LegalParagraph>
// 			<LegalParagraph>
// 				<strong>Right to Object:</strong> You have the right to object to processing of your personal information that
// 				is based on our legitimate interests or public interest. If this is done, we must provide compelling legitimate
// 				grounds for the processing which overrides your interests, rights, and freedoms, in order to proceed with the
// 				processing of your personal information.
// 			</LegalParagraph>
// 			<LegalParagraph>
// 				<strong>Right to be Informed:</strong> You have the right to be informed with how your data is collected,
// 				processed, shared and stored.
// 			</LegalParagraph>
// 			<LegalParagraph>
// 				<strong>Right of Access:</strong> You may request a copy of the personal information that we hold about you at
// 				any time by submitting a Data Subject Access Request (DSAR). The statutory deadline for fulfilling a DSAR
// 				request is 30 calendar days from our receipt of your request.
// 			</LegalParagraph>
// 			<LegalParagraph>
// 				<strong>Right to Erasure:</strong> In certain circumstances, you can ask for your personal data to be erased
// 				from the records held by organizations. However this is a qualified right; it is not absolute, and may only
// 				apply in certain circumstances.
// 			</LegalParagraph>
// 			<LegalParagraph>When may the right to erasure apply?</LegalParagraph>
// 			<ul className="mb-4 list-disc space-y-2 pl-6">
// 				<li>
// 					When the personal data is no longer necessary for the purpose for which it was originally collected or
// 					processed for.
// 				</li>
// 				<li>
// 					If consent was the lawful basis for processing personal data and that consent has been withdrawn.
// 					{COMPANY_NAME} relies on consent to process personal data in very few circumstances.
// 				</li>
// 				<li>
// 					The Company is relying on legitimate interests as a legal basis for processing personal data and an individual
// 					has exercised the right to object and it has been determined that the Company has no overriding legitimate
// 					grounds to refuse that request.
// 				</li>
// 				<li>
// 					Personal data are being processed for direct marketing purposes e.g. a person&apos;s name and email address,
// 					and the individual objects to that processing.
// 				</li>
// 				<li>There is legislation that requires that personal data are to be destroyed.</li>
// 			</ul>
// 			<LegalParagraph>
// 				<strong>Right to Portability:</strong> Individuals have the right to get some of their personal data from an
// 				organisation in a way that is accessible and machine-readable, for example as a csv file. Associated with this,
// 				individuals also have the right to ask an organisation to transfer their personal data to another organisation.
// 			</LegalParagraph>
// 			<LegalParagraph>However, the right to portability:</LegalParagraph>
// 			<ul className="mb-4 list-disc space-y-2 pl-6">
// 				<li>
// 					only applies to personal data which a person has directly given to {COMPANY_NAME} in electronic form; and
// 				</li>
// 				<li>onward transfer will only be available where this is &quot;technically feasible&quot;.</li>
// 			</ul>
// 			<LegalParagraph>
// 				<strong>Right to Rectification:</strong> If personal data is inaccurate, out of date, or incomplete, individuals
// 				have the right to correct, update or complete that data. Collectively this is referred to as the right to
// 				rectification. Rectification may involve filling the gaps i.e. to have to have incomplete personal data
// 				completed - although this will depend on the purposes for the processing. This may involve adding a
// 				supplementary statement to the incomplete data to highlight any inaccuracy or claim thereof.
// 			</LegalParagraph>
// 			<LegalParagraph>
// 				This right only applies to an individual&apos;s own personal data; a person cannot seek the rectification of
// 				another person&apos;s information.
// 			</LegalParagraph>
// 			<LegalParagraph>
// 				<strong>Notification of data breaches:</strong> Upon discovery of a data breach, we will investigate the
// 				incident and report it to the UK&apos;s data protection regulator and yourself, if we deem it appropriate to do
// 				so.
// 			</LegalParagraph>
// 			<LegalParagraph>
// 				<strong>Complaints:</strong> You have the right, at any time, to lodge a complaint with a relevant data
// 				protection authority. We would, however, appreciate the chance to deal with your concerns before you approach a
// 				regulator, so please contact us in the first instance. Please provide us with as much information as you can
// 				about the alleged breach. We will promptly investigate your complaint and respond to you, in writing, setting
// 				out the outcome of our investigation and the steps we will take to deal with your complaint.
// 			</LegalParagraph>

// 			<LegalHeading3>Enquiries, Reports and Escalation</LegalHeading3>
// 			<LegalParagraph>
// 				To enquire about {COMPANY_NAME}&apos;s privacy policy, or to report violations of user privacy, you may contact
// 				our Data Protection Officer using the details in the Contact us section of this privacy policy.
// 			</LegalParagraph>
// 		</section>
// 	);
// }

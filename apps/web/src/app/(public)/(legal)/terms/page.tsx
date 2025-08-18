import { LegalHeading1, LegalHeading2, LegalParagraph, LegalTextLink } from "@/components/landing-page/legal/text";
import { COMPANY_NAME, COUNTRY, LEGAL_UPDATE_DATE, STATE, URL } from "@nimbus/shared";
import { Card, CardContent } from "@/components/ui/card";
import type { Metadata } from "next";

// this is a copy of Analogs terms component with some changes
// https://github.com/analogdotnow/Analog/blob/main/apps/web/src/app/(legal)/terms/page.tsx

export const metadata: Metadata = {
	title: `Terms of Service - ${COMPANY_NAME}`,
};

export default function TermsPage() {
	return (
		<main>
			<div className="container mx-auto px-4 py-16">
				<div className="mx-auto max-w-4xl">
					<div className="pb-10 text-center">
						<LegalHeading1>Terms of Service</LegalHeading1>
					</div>
					<Card className="border-2 shadow-none">
						<CardContent className="space-y-8 p-8 text-base leading-relaxed">
							<LegalParagraph>
								These Terms of Service govern your use of the website located at{" "}
								<LegalTextLink href={URL}>{URL}</LegalTextLink> and any related services provided by {COMPANY_NAME}.
							</LegalParagraph>

							<LegalParagraph>
								By accessing <LegalTextLink href={URL}>{URL}</LegalTextLink>, you agree to abide by these Terms of
								Service and to comply with all applicable laws and regulations. If you do not agree with these Terms of
								Service, you are prohibited from using or accessing this website or using any other services provided by{" "}
								{COMPANY_NAME}.
							</LegalParagraph>

							<LegalParagraph>
								We, {COMPANY_NAME}, reserve the right to review and amend any of these Terms of Service at our sole
								discretion. Upon doing so, we will update this page. Any changes to these Terms of Service will take
								effect immediately from the date of publication.
							</LegalParagraph>

							<LegalParagraph>These Terms of Service were last updated on {LEGAL_UPDATE_DATE}.</LegalParagraph>

							<section>
								<LegalHeading2>Limitations of Use</LegalHeading2>
								<LegalParagraph>
									By using this website, you warrant on behalf of yourself, your users, and other parties you represent
									that you will not:
								</LegalParagraph>
								<ul className="mb-4 list-disc space-y-2 pl-6">
									<li>
										modify, copy, prepare derivative works of, decompile, or reverse engineer any materials and software
										contained on this website;
									</li>
									<li>
										remove any copyright or other proprietary notations from any materials and software on this website;
									</li>
									<li>
										transfer the materials to another person or &quot;mirror&quot; the materials on any other server;
									</li>
									<li>
										knowingly or negligently use this website or any of its associated services in a way that abuses or
										disrupts our networks or any other service {COMPANY_NAME} provides;
									</li>
									<li>
										use this website or its associated services to transmit or publish any harassing, indecent, obscene,
										fraudulent, or unlawful material;
									</li>
									<li>
										use this website or its associated services in violation of any applicable laws or regulations;
									</li>
									<li>use this website in conjunction with sending unauthorized advertising or spam;</li>
									<li>harvest, collect, or gather user data without the user&apos;s consent; or</li>
									<li>
										use this website or its associated services in such a way that may infringe the privacy,
										intellectual property rights, or other rights of third parties.
									</li>
								</ul>
							</section>

							<section>
								<LegalHeading2>Intellectual Property</LegalHeading2>
								<LegalParagraph>
									The intellectual property in the materials contained in this website are owned by or licensed to
									{COMPANY_NAME} and are protected by applicable copyright and trademark law. We grant our users
									permission to download one copy of the materials for personal, non-commercial transitory use.
								</LegalParagraph>
								<LegalParagraph>
									This constitutes the grant of a license, not a transfer of title. This license shall automatically
									terminate if you violate any of these restrictions or the Terms of Service, and may be terminated by
									{COMPANY_NAME} at any time.
								</LegalParagraph>
							</section>

							<section>
								<LegalHeading2>Liability</LegalHeading2>
								<LegalParagraph>
									Our website and the materials on our website are provided on an &apos;as is&apos; basis. To the extent
									permitted by law, {COMPANY_NAME} makes no warranties, expressed or implied, and hereby disclaims and
									negates all other warranties including, without limitation, implied warranties or conditions of
									merchantability, fitness for a particular purpose, or non-infringement of intellectual property, or
									other violation of rights.
								</LegalParagraph>
								<LegalParagraph>
									In no event shall {COMPANY_NAME} or its suppliers be liable for any consequential loss suffered or
									incurred by you or any third party arising from the use or inability to use this website or the
									materials on this website, even if {COMPANY_NAME} or an authorized representative has been notified,
									orally or in writing, of the possibility of such damage.
								</LegalParagraph>
								<LegalParagraph>
									In the context of this agreement, &quot;consequential loss&quot; includes any consequential loss,
									indirect loss, real or anticipated loss of profit, loss of benefit, loss of revenue, loss of business,
									loss of goodwill, loss of opportunity, loss of savings, loss of reputation, loss of use and/or loss or
									corruption of data, whether under statute, contract, equity, tort (including negligence), indemnity or
									otherwise.
								</LegalParagraph>
								<LegalParagraph>
									Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability
									for consequential or incidental damages, these limitations may not apply to you.
								</LegalParagraph>
							</section>

							<section>
								<LegalHeading2>Accuracy of Materials</LegalHeading2>
								<LegalParagraph>
									The materials appearing on our website are not comprehensive and are for general information purposes
									only. {COMPANY_NAME} does not warrant or make any representations concerning the accuracy, likely
									results, or reliability of the use of the materials on this website, or otherwise relating to such
									materials or on any resources linked to this website.
								</LegalParagraph>
							</section>

							<section>
								<LegalHeading2>Links</LegalHeading2>
								<LegalParagraph>
									{COMPANY_NAME} has not reviewed all of the sites linked to its website and is not responsible for the
									contents of any such linked site. The inclusion of any link does not imply endorsement, approval or
									control by {COMPANY_NAME} of the site. Use of any such linked site is at your own risk and we strongly
									advise you make your own investigations with respect to the suitability of those sites.
								</LegalParagraph>
							</section>

							<section>
								<LegalHeading2>Right to Terminate</LegalHeading2>
								<LegalParagraph>
									We may suspend or terminate your right to use our website and terminate these Terms of Service
									immediately upon written notice to you for any breach of these Terms of Service.
								</LegalParagraph>
							</section>

							<section>
								<LegalHeading2>Severance</LegalHeading2>
								<LegalParagraph>
									Any term of these Terms of Service which is wholly or partially void or unenforceable is severed to
									the extent that it is void or unenforceable. The validity of the remainder of these Terms of Service
									is not affected.
								</LegalParagraph>
							</section>

							<section>
								<LegalHeading2>Governing Law</LegalHeading2>
								<LegalParagraph>
									These Terms of Service are governed by and construed in accordance with the laws of {STATE}, {COUNTRY}
									. You irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
								</LegalParagraph>
							</section>
						</CardContent>
					</Card>
				</div>
			</div>
		</main>
	);
}

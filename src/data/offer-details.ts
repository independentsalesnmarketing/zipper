export interface OfferDetails { sections: { title: string; paragraphs: string[] }[]; copyright?: string }
export const offerDetails: Record<string, OfferDetails> = {
  optimum: {
    sections: [
      { title: 'Pricing and Price Guarantee', paragraphs: [
        '300 Mbps Fiber: $35/month. 500 Mbps Fiber: $45/month. 1 Gig Fiber: $55/month. 2 Gig Fiber: $65/month.',
        'Advertised pricing includes a $10/month discount requiring AutoPay through an eligible checking account and paperless billing. Promotional pricing applies for 12 months. After 12 months, prices may increase by no more than $15/month per year until standard rates are reached. Taxes and applicable fees are additional.',
        'Service renews monthly until canceled. Customers can cancel by calling 877-694-9474. Cancellation generally takes effect at the end of the current billing period, with applicable state exceptions.',
        'Promotional offers are limited to eligible new residential customers, qualifying service areas, and accounts in good standing. Promotional offers are nontransferable and subject to applicable restrictions.'
      ] },
      { title: 'Internet Speeds', paragraphs: [
        '300 Mbps: Up to 300 Mbps download and upload. 500 Mbps: Up to 500 Mbps download and upload. 1 Gig: Up to 940 Mbps download and upload.',
        'Advertised maximum speeds are based on wired connections. Actual speeds, including Wi-Fi speeds, vary by equipment, location, network conditions, and device capabilities. Additional speed information: optimum.com/speedfactors.'
      ] },
      { title: '$50 Visa Prepaid Card', paragraphs: [
        'Requires qualifying 1 Gig Internet and one Unlimited or Unlimited Max Mobile line. Requires ACH AutoPay and paperless billing.',
        'Customer must remain in good standing for 90 days following activation. Disconnection, past-due balances, or returned payments during the qualifying period may result in ineligibility. Customers who received certain prepaid-card or gift promotions within the previous 12 months are ineligible. Limit one prepaid card per customer.',
        'Eligible customers receive the prepaid card after verification. Virtual delivery generally occurs within 48–72 hours of eligibility verification. Physical cards may take four to six weeks after the qualifying period.',
        'Cards expire 12 months after issuance. Cards cannot be used to pay Optimum bills. No cash or ATM access. Cards are issued by Pathward, N.A., Member FDIC, pursuant to a Visa U.S.A. Inc. license. Applicable cardholder terms apply.'
      ] },
      { title: 'Additional Conditions', paragraphs: [
        'Qualifying mobile promotions require eligible new mobile lines and AutoPay. A $25 mobile activation fee and applicable taxes, roaming charges, and other fees may apply.',
        'Equipment and gateway availability depend on the qualifying plan. Professional installation charges may apply.',
        'The 60-day money-back guarantee applies to eligible internet monthly service charges when requested within the qualifying period. Eligible competitor installation reimbursement requires qualifying documentation submitted within 60 days.',
        'Promotions, pricing, and availability are subject to change.'
      ] }
    ], copyright: '© 2026 CSC Holdings, LLC.'
  },
  kinetic: {
    sections: [
      { title: 'Promotional Eligibility', paragraphs: [
        'Limited-time offers for qualifying residential customers. Eligible new customers must not have received Kinetic Internet service within the previous 30 days. Pricing and availability vary by location. Credit restrictions and other service conditions may apply. Offers are subject to Kinetic’s Terms and Conditions and Acceptable Use Policy.'
      ] },
      { title: 'AutoPay', paragraphs: [
        'Qualifying advertised pricing includes a $5/month AutoPay credit. AutoPay requires separate enrollment through gokinetic.com/gokinetic or 877-807-9463. The credit may take up to two billing cycles to appear. Applicable taxes, surcharges, and equipment charges are additional.'
      ] },
      { title: 'Equipment and Whole Home Wi-Fi', paragraphs: [
        'Kinetic-provided modems support Wi-Fi connectivity. Actual device speeds may be lower than advertised speeds. Modems must be returned when service ends; a $100 unreturned-equipment charge may apply.',
        'Standard Kinetic Wi-Fi Gateway rate: $10.99/month. Up to two eligible Wi-Fi extenders: $10/month when not included in the plan. Additional extenders: $5/month each when not included.',
        'Technicians use a 20-point Wi-Fi checklist. Coverage and performance depend on the home’s construction, layout, interference, connected devices, and equipment. Additional equipment or wiring may involve extra charges.'
      ] },
      { title: 'Reward Card Offers', paragraphs: [
        'Qualifying 1 Gig service: $50 reward. Qualifying 2 Gig service: $100 reward. Eligible Max bundled plans of 1 Gig or higher: $300 reward. Reward availability depends on the qualifying plan.',
        'Customer must activate qualifying service and remain in good standing for at least 90 days. Maximum one reward card per household. Government accounts are ineligible. Eligible customers receive a redemption email following verification.',
        'Electronic or physical prepaid Mastercard delivery is available. Physical delivery involves a $3 shipping and handling deduction. Physical cards generally ship within five to seven business days.',
        'Cards are issued by The Bancorp Bank, Member FDIC, pursuant to a Mastercard International Incorporated license. Cardholder terms, fees, and expiration conditions apply.'
      ] },
      { title: 'Reliability and Performance', paragraphs: [
        'The advertised 99.9% service availability is based on Kinetic’s March 2023–December 2025 measurements, excluding planned maintenance, emergencies, severe weather, and other uncontrollable events.',
        'Actual speeds and Wi-Fi performance vary. Whole Home Wi-Fi installation is based on reasonable efforts to optimize accessible living spaces. Additional service restrictions apply.'
      ] }
    ], copyright: '© 2026 Uniti Group, Inc.'
  },
  frontier: {
    sections: [
      { title: 'Promotional Terms', paragraphs: [
        'Promotional prices are guaranteed for 12 months. Offers apply to eligible new residential internet customers. Availability varies by address. Promotional offers are time-limited and subject to applicable restrictions.',
        'A prorated early termination fee applies when qualifying service is canceled during months 1–12, based on $100 or the value of a selected promotional gift card.'
      ] },
      { title: 'AutoPay and Billing', paragraphs: [
        'Qualifying advertised prices require bank-account AutoPay and paperless billing. Credit-card AutoPay costs an additional $5/month. Service without AutoPay costs an additional $10/month. Printed billing is available for up to $4.50/month, with exemptions for eligible customers.'
      ] },
      { title: 'Equipment', paragraphs: [
        'Qualifying plans may include an Amazon eero Wi-Fi router. A $50 equipment restocking fee per household applies when internet service is disconnected. Unreturned equipment charges of up to $500 per device may apply. Additional equipment and service fees may apply.'
      ] },
      { title: 'Speeds and Performance', paragraphs: [
        'Maximum advertised speeds are measured over eligible wired connections. Actual and Wi-Fi speeds vary. 2 Gig requires compatible 2 Gbps devices and wiring. 5 Gig requires compatible 5 Gbps devices and wiring. eero performance varies according to building conditions, equipment, and interference.'
      ] },
      { title: 'Unbreakable Wi-Fi', paragraphs: [
        'Where offered, backup Wi-Fi may be free for the first month and $25/month afterward. Backup connectivity uses a third-party cellular network during qualifying internet outages. Data allowance is capped at 130 GB per billing cycle. Maximum cellular speeds are 50 Mbps download and 5 Mbps upload. Backup performance depends on cellular coverage and availability.',
        'Service requires eligible Frontier Fiber Internet and an eero router. Backup equipment must be returned; charges up to $250 may apply.',
        'Backup connectivity does not operate during power outages and is unsuitable for emergency/911 and certain medical uses. Additional details: frontier.com/unbreakablewifi and frontier.com/unbreakableterms.'
      ] },
      { title: 'Additional Conditions', paragraphs: ['Additional service terms, taxes, fees, availability restrictions, and Frontier policies apply.'] }
    ], copyright: '© 2026 Verizon.'
  },
  earthlink: {
    sections: [
      { title: 'Speeds and Availability', paragraphs: ['Actual speeds may vary depending on the distance, line-quality, phone service provider, and number of devices used concurrently. All speeds not available in all areas. Exclusions, taxes, fees, or modem service charges may apply. Not available in all areas. Limited-time offer; subject to change.'] },
      { title: 'Additional Conditions', paragraphs: ['Equipment lease fees may be charged separately. Qualifying EarthLink Fiber plans offer unlimited data without speed throttling. Eligible offers may include a price-lock guarantee of up to 24 months. Availability, pricing, and qualifying promotional conditions vary by address.'] }
    ], copyright: '© 2026 EarthLink, LLC. All rights reserved.'
  },
  brightspeed: {
    sections: [
      { title: 'Availability and Speeds', paragraphs: ['Limited availability in select areas. Limited time offer. Speed based on wired connection. WiFi speeds may vary.'] },
      { title: 'Three-Month-Free Promotion', paragraphs: ['3 Month Free offer: via bill credit in mo. 1 and reward card in mos. 6 and 12. Redemption required. Taxes & fees extra.'] },
      { title: 'Promotional Pricing', paragraphs: ['Promotional price: Qualifying, new Brightspeed customers only. Subject to change. Promotion offered through bill credit. Standard rates apply after promotion period. Select plans only.'] },
      { title: 'Additional Conditions', paragraphs: ['Promotional rewards require qualifying service and successful redemption. Promotional prices are available to eligible new customers in qualifying areas. Actual speeds vary by connection type, equipment, and location. Applicable taxes and fees are additional. Standard rates apply after the promotional period.'] }
    ]
  }
};

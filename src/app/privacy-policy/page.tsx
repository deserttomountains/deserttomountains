import React from "react";
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Shield, User, Mail, Globe, Lock, AlertCircle, Cookie, ArrowRight, Info } from 'lucide-react';

const sections = [
  {
    icon: <User className="w-7 h-7 text-[#E6C866]" />, title: 'General',
    content: (
      <>
        <p>The Personal Information which You may provide to us and/or which we may collect is or could be the following:</p>
        <ol className="list-decimal ml-6">
          <li>Your registration details which may include the email address and password provided by You. We adopt reasonable security measures to protect Your password from being exposed or disclosed to anyone including the Platform.</li>
          <li>Your shipping, billing, tax registration, and other information pertaining to Your sale or purchase transaction on the Website.</li>
          <li>Your transaction details with the other users of the Website. Your usage behavior of the Website.</li>
          <li>Details of the computer system or computer network which You use to visit the Website and undertake any activity on the Website.</li>
        </ol>
        <p className="mt-2">Our primary purposes in collecting information from You are to allow You to use the Website and various features and services offered by the Platform; contact you for any services provided by the Platform or its affiliates; to record Your information and details as permitted and required under applicable laws; to serve various promotion materials and advertising materials to you; and such other uses as provided in the User Agreement and this Privacy Policy.</p>
      </>
    )
  },
  {
    icon: <Globe className="w-7 h-7 text-[#E6C866]" />, title: 'Information Sharing & Disclosure',
    content: (
      <p>Platform is the recipient of all the Personal Information and shall exercise reasonable commercial endeavors for the prevention of the Personal Information provided by the Users. We may enable access of the Users’ information to the Platform Entities, joint ventures, agents or third parties for the purposes of the services provided by them or for any other marketing related activity. We ensure on reasonable commercial efforts basis that the third parties and agents employed by us are under an obligation to maintain confidentiality and use it strictly for the purposes of the Website only.</p>
    )
  },
  {
    icon: <AlertCircle className="w-7 h-7 text-[#E6C866]" />, title: 'Compliance with Laws',
    content: (
      <p>Platform cooperates with mandated government and law enforcement agencies or to any third parties by an order under law to enforce and comply with the law. We will disclose any information about You to government or law enforcement officials or private parties as we, in our sole discretion, believe necessary or appropriate to respond to claims and legal process, to protect the property and rights of Platform or a third party, to protect the safety of the public or any person, or to prevent or stop any illegal, unethical or legally actionable activity.</p>
    )
  },
  {
    icon: <ArrowRight className="w-7 h-7 text-[#E6C866]" />, title: 'Business Transfers',
    content: (
      <p>Platform may sell, transfer or otherwise share some or all of its assets, including your Personal Information, in connection with a merger, acquisition, reorganization or sale of assets or in the event of bankruptcy. Should such a sale or transfer occur, we will ensure that the Personal Information You have provided through the Website is stored and used by the transferee in a manner that is consistent with this Privacy Policy.</p>
    )
  },
  {
    icon: <Mail className="w-7 h-7 text-[#E6C866]" />, title: 'Email Policies',
    content: (
      <p>Platform may use your Personal Information for the aforementioned purposes of the Website. You have full control regarding which of these emails You want to receive. If You decide at any time that You no longer wish to receive such communications from us, please follow the unsubscribe instructions provided in any of the communications.</p>
    )
  },
  {
    icon: <Lock className="w-7 h-7 text-[#E6C866]" />, title: 'Security',
    content: (
      <p>Platform uses ordinary industry standard technology designed to help keep your Personal Information safe. The secure server software (SSL) encrypts all information You put in before it is sent to us. All customer data we collect is protected against unauthorized access. We employ commercially reasonable and practicable security practices and procedures and security methods and technologies.</p>
    )
  },
  {
    icon: <Cookie className="w-7 h-7 text-[#E6C866]" />, title: 'Cookie Policy',
    content: (
      <p>For enhanced shopping experience, Desert to mountains uses cookies to store your browsing information. Cookies do not save your PII (personally identifiable information), though you can change the cookie settings as per your preferences. By using the website, we believe that you consent with the cookie policy.</p>
    )
  },
  {
    icon: <Info className="w-7 h-7 text-[#E6C866]" />, title: 'Contact & More Information',
    content: (
      <>
        <p>If You have any questions about this Privacy Policy, the practices of Platform or your dealings with the Website, You can contact us:</p>
        <ul className="list-disc ml-6">
          <li>Email: <a href="mailto:deserttomountains@gmail.com" className="text-[#5E4E06] underline">deserttomountains@gmail.com</a></li>
          <li>Phone: <a href="tel:+918171189456" className="text-[#5E4E06] underline">+91 81711 89456</a></li>
        </ul>
      </>
    )
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#F8F6F0] via-[#F0EDE4] to-[#E8E4D8]">
      <Navigation />
      {/* Hero Section */}
      <section className="relative w-full h-64 flex items-center justify-center bg-cover bg-center" style={{backgroundImage: 'url(/images/about_page_img.jpg)'}}>
        <div className="absolute inset-0 bg-[#5E4E06]/70" />
        <div className="relative z-10 text-center">
          <h1 className="text-5xl font-extrabold text-white drop-shadow mb-2">Privacy Policy</h1>
          <p className="text-lg text-[#E6C866] font-medium drop-shadow">Your privacy, our promise. Learn how we protect your data.</p>
        </div>
      </section>
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        <div className="space-y-8">
          {/* Key Principles Callout */}
          <div className="bg-[#FFF9E6] border-l-4 border-[#E6C866] rounded-xl shadow p-6 flex items-start gap-4">
            <Shield className="w-8 h-8 text-[#E6C866] flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold text-[#5E4E06] mb-2">Our Privacy Principles</h2>
              <ul className="list-disc ml-6 text-[#2A2418]">
                <li>Providing information to us is your choice.</li>
                <li>You can choose to have the Personal Information provided by You deleted.</li>
                <li>You always have the ability to opt-out of receiving communications from us.</li>
              </ul>
            </div>
          </div>
          {/* Section Cards */}
          {sections.map((section, idx) => (
            <div key={idx} className="bg-white/90 rounded-2xl shadow-lg p-6 flex items-start gap-4 border border-[#E6C866]/30">
              <div className="mt-1">{section.icon}</div>
              <div>
                <h3 className="text-xl font-semibold text-[#5E4E06] mb-2 flex items-center gap-2">{section.title}</h3>
                <div className="text-[#2A2418] prose prose-sm max-w-none">{section.content}</div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
} 
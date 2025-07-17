'use client';

import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, MapPin, Building, Globe, Hash } from 'lucide-react';

interface Address {
  fullName: string;
  phone: string;
  email: string;
  country: string;
  state: string;
  city: string;
  postalCode: string;
  addressLine1: string;
  addressLine2: string;
}

interface UniversalAddressFormProps {
  address: Address;
  onChange: (field: string, value: string) => void;
  title: string;
  subtitle: string;
  required?: boolean;
  errors?: { [key: string]: string };
  showTitle?: boolean;
}

// Comprehensive list of countries
export const COUNTRIES = [
  { code: 'AF', name: 'Afghanistan' },
  { code: 'AL', name: 'Albania' },
  { code: 'DZ', name: 'Algeria' },
  { code: 'AD', name: 'Andorra' },
  { code: 'AO', name: 'Angola' },
  { code: 'AG', name: 'Antigua and Barbuda' },
  { code: 'AR', name: 'Argentina' },
  { code: 'AM', name: 'Armenia' },
  { code: 'AU', name: 'Australia' },
  { code: 'AT', name: 'Austria' },
  { code: 'AZ', name: 'Azerbaijan' },
  { code: 'BS', name: 'Bahamas' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'BB', name: 'Barbados' },
  { code: 'BY', name: 'Belarus' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BZ', name: 'Belize' },
  { code: 'BJ', name: 'Benin' },
  { code: 'BT', name: 'Bhutan' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'BA', name: 'Bosnia and Herzegovina' },
  { code: 'BW', name: 'Botswana' },
  { code: 'BR', name: 'Brazil' },
  { code: 'BN', name: 'Brunei' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'BI', name: 'Burundi' },
  { code: 'CV', name: 'Cabo Verde' },
  { code: 'KH', name: 'Cambodia' },
  { code: 'CM', name: 'Cameroon' },
  { code: 'CA', name: 'Canada' },
  { code: 'CF', name: 'Central African Republic' },
  { code: 'TD', name: 'Chad' },
  { code: 'CL', name: 'Chile' },
  { code: 'CN', name: 'China' },
  { code: 'CO', name: 'Colombia' },
  { code: 'KM', name: 'Comoros' },
  { code: 'CG', name: 'Congo' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'HR', name: 'Croatia' },
  { code: 'CU', name: 'Cuba' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'CD', name: 'Democratic Republic of the Congo' },
  { code: 'DK', name: 'Denmark' },
  { code: 'DJ', name: 'Djibouti' },
  { code: 'DM', name: 'Dominica' },
  { code: 'DO', name: 'Dominican Republic' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'EG', name: 'Egypt' },
  { code: 'SV', name: 'El Salvador' },
  { code: 'GQ', name: 'Equatorial Guinea' },
  { code: 'ER', name: 'Eritrea' },
  { code: 'EE', name: 'Estonia' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'FJ', name: 'Fiji' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'GA', name: 'Gabon' },
  { code: 'GM', name: 'Gambia' },
  { code: 'GE', name: 'Georgia' },
  { code: 'DE', name: 'Germany' },
  { code: 'GH', name: 'Ghana' },
  { code: 'GR', name: 'Greece' },
  { code: 'GD', name: 'Grenada' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'GN', name: 'Guinea' },
  { code: 'GW', name: 'Guinea-Bissau' },
  { code: 'GY', name: 'Guyana' },
  { code: 'HT', name: 'Haiti' },
  { code: 'HN', name: 'Honduras' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IS', name: 'Iceland' },
  { code: 'IN', name: 'India' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'IR', name: 'Iran' },
  { code: 'IQ', name: 'Iraq' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IL', name: 'Israel' },
  { code: 'IT', name: 'Italy' },
  { code: 'JM', name: 'Jamaica' },
  { code: 'JP', name: 'Japan' },
  { code: 'JO', name: 'Jordan' },
  { code: 'KZ', name: 'Kazakhstan' },
  { code: 'KE', name: 'Kenya' },
  { code: 'KI', name: 'Kiribati' },
  { code: 'KP', name: 'North Korea' },
  { code: 'KR', name: 'South Korea' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'KG', name: 'Kyrgyzstan' },
  { code: 'LA', name: 'Laos' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LB', name: 'Lebanon' },
  { code: 'LS', name: 'Lesotho' },
  { code: 'LR', name: 'Liberia' },
  { code: 'LY', name: 'Libya' },
  { code: 'LI', name: 'Liechtenstein' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MG', name: 'Madagascar' },
  { code: 'MW', name: 'Malawi' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'MV', name: 'Maldives' },
  { code: 'ML', name: 'Mali' },
  { code: 'MT', name: 'Malta' },
  { code: 'MH', name: 'Marshall Islands' },
  { code: 'MR', name: 'Mauritania' },
  { code: 'MU', name: 'Mauritius' },
  { code: 'MX', name: 'Mexico' },
  { code: 'FM', name: 'Micronesia' },
  { code: 'MD', name: 'Moldova' },
  { code: 'MC', name: 'Monaco' },
  { code: 'MN', name: 'Mongolia' },
  { code: 'ME', name: 'Montenegro' },
  { code: 'MA', name: 'Morocco' },
  { code: 'MZ', name: 'Mozambique' },
  { code: 'MM', name: 'Myanmar' },
  { code: 'NA', name: 'Namibia' },
  { code: 'NR', name: 'Nauru' },
  { code: 'NP', name: 'Nepal' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'NI', name: 'Nicaragua' },
  { code: 'NE', name: 'Niger' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'NO', name: 'Norway' },
  { code: 'OM', name: 'Oman' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'PW', name: 'Palau' },
  { code: 'PA', name: 'Panama' },
  { code: 'PG', name: 'Papua New Guinea' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'PE', name: 'Peru' },
  { code: 'PH', name: 'Philippines' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'QA', name: 'Qatar' },
  { code: 'RO', name: 'Romania' },
  { code: 'RU', name: 'Russia' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'KN', name: 'Saint Kitts and Nevis' },
  { code: 'LC', name: 'Saint Lucia' },
  { code: 'VC', name: 'Saint Vincent and the Grenadines' },
  { code: 'WS', name: 'Samoa' },
  { code: 'SM', name: 'San Marino' },
  { code: 'ST', name: 'Sao Tome and Principe' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'SN', name: 'Senegal' },
  { code: 'RS', name: 'Serbia' },
  { code: 'SC', name: 'Seychelles' },
  { code: 'SL', name: 'Sierra Leone' },
  { code: 'SG', name: 'Singapore' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'SB', name: 'Solomon Islands' },
  { code: 'SO', name: 'Somalia' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'SS', name: 'South Sudan' },
  { code: 'ES', name: 'Spain' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'SD', name: 'Sudan' },
  { code: 'SR', name: 'Suriname' },
  { code: 'SZ', name: 'Eswatini' },
  { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'SY', name: 'Syria' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'TJ', name: 'Tajikistan' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'TH', name: 'Thailand' },
  { code: 'TL', name: 'Timor-Leste' },
  { code: 'TG', name: 'Togo' },
  { code: 'TO', name: 'Tonga' },
  { code: 'TT', name: 'Trinidad and Tobago' },
  { code: 'TN', name: 'Tunisia' },
  { code: 'TR', name: 'Turkey' },
  { code: 'TM', name: 'Turkmenistan' },
  { code: 'TV', name: 'Tuvalu' },
  { code: 'UG', name: 'Uganda' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'UZ', name: 'Uzbekistan' },
  { code: 'VU', name: 'Vanuatu' },
  { code: 'VA', name: 'Vatican City' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'YE', name: 'Yemen' },
  { code: 'ZM', name: 'Zambia' },
  { code: 'ZW', name: 'Zimbabwe' }
].sort((a, b) => a.name.localeCompare(b.name));

const UniversalAddressForm: React.FC<UniversalAddressFormProps> = ({
  address,
  onChange,
  title,
  subtitle,
  required = true,
  errors = {},
  showTitle = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);

  const filteredCountries = COUNTRIES.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPostalCodeLabel = (countryCode: string) => {
    const labels: { [key: string]: string } = {
      'US': 'ZIP Code',
      'CA': 'Postal Code',
      'GB': 'Postcode',
      'IN': 'PIN Code',
      'AU': 'Postcode',
      'DE': 'Postleitzahl',
      'FR': 'Code Postal',
      'IT': 'CAP',
      'ES': 'Código Postal',
      'NL': 'Postcode',
      'BR': 'CEP',
      'MX': 'Código Postal',
      'JP': '郵便番号',
      'CN': '邮政编码',
      'KR': '우편번호',
      'RU': 'Почтовый индекс'
    };
    return labels[countryCode] || 'Postal Code';
  };

  const getStateLabel = (countryCode: string) => {
    const labels: { [key: string]: string } = {
      'US': 'State',
      'CA': 'Province',
      'AU': 'State/Territory',
      'IN': 'State',
      'BR': 'State',
      'MX': 'State',
      'DE': 'State',
      'GB': 'County',
      'FR': 'Region',
      'IT': 'Region',
      'ES': 'Province',
      'NL': 'Province',
      'JP': 'Prefecture',
      'CN': 'Province',
      'KR': 'Province',
      'RU': 'Region'
    };
    return labels[countryCode] || 'State/Province';
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-[#D4AF37] p-8 md:p-10 animate-fade-in">
      {showTitle && (
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] flex items-center justify-center shadow-lg">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#5E4E06]">{title}</h2>
            <p className="text-[#8B7A1A] text-lg">{subtitle}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Information */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-[#8B7A1A]" />
            <span className="text-lg font-semibold text-[#8B7A1A]">Personal Details</span>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-[#8B7A1A] mb-3">
              Full Name {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
              <input
                type="text"
                value={address.fullName}
                onChange={(e) => onChange('fullName', e.target.value)}
                className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 transition-all duration-300
                  focus:outline-none focus:ring-4 focus:ring-offset-0
                  ${errors.fullName 
                    ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                    : 'border-[#D4AF37] focus:ring-[#8B7A1A]/20 focus:border-[#8B7A1A] hover:border-[#8B7A1A]'
                  }
                  hover:shadow-xl cursor-text bg-white/90 backdrop-blur-sm
                  placeholder:text-[#8B7A1A] placeholder:font-medium text-[#5E4E06] font-medium text-base
                `}
                placeholder="Enter your full name"
              />
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8B7A1A]" />
            </div>
            {errors.fullName && (
              <p className="mt-2 text-sm text-red-500">{errors.fullName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#8B7A1A] mb-3">
              Phone Number {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
              <input
                type="tel"
                value={address.phone}
                onChange={(e) => onChange('phone', e.target.value)}
                className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 transition-all duration-300
                  focus:outline-none focus:ring-4 focus:ring-offset-0
                  ${errors.phone 
                    ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                    : 'border-[#D4AF37] focus:ring-[#8B7A1A]/20 focus:border-[#8B7A1A] hover:border-[#8B7A1A]'
                  }
                  hover:shadow-xl cursor-text bg-white/90 backdrop-blur-sm
                  placeholder:text-[#8B7A1A] placeholder:font-medium text-[#5E4E06] font-medium text-base
                `}
                placeholder="Enter phone number"
              />
              <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8B7A1A]" />
            </div>
            {errors.phone && (
              <p className="mt-2 text-sm text-red-500">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#8B7A1A] mb-3">
              Email Address {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
              <input
                type="email"
                value={address.email}
                onChange={(e) => onChange('email', e.target.value)}
                className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 transition-all duration-300
                  focus:outline-none focus:ring-4 focus:ring-offset-0
                  ${errors.email 
                    ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                    : 'border-[#D4AF37] focus:ring-[#8B7A1A]/20 focus:border-[#8B7A1A] hover:border-[#8B7A1A]'
                  }
                  hover:shadow-xl cursor-text bg-white/90 backdrop-blur-sm
                  placeholder:text-[#8B7A1A] placeholder:font-medium text-[#5E4E06] font-medium text-base
                `}
                placeholder="Enter email address"
              />
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8B7A1A]" />
            </div>
            {errors.email && (
              <p className="mt-2 text-sm text-red-500">{errors.email}</p>
            )}
          </div>
        </div>

        {/* Address Information */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <Building className="w-5 h-5 text-[#8B7A1A]" />
            <span className="text-lg font-semibold text-[#8B7A1A]">Address Details</span>
          </div>
          
          {/* Country Selection */}
          <div className="relative">
            <label className="block text-sm font-semibold text-[#8B7A1A] mb-3">
              Country {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                className={`w-full pl-12 pr-12 py-4 rounded-2xl border-2 transition-all duration-300 text-left
                  focus:outline-none focus:ring-4 focus:ring-offset-0
                  ${errors.country 
                    ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                    : 'border-[#D4AF37] focus:ring-[#8B7A1A]/20 focus:border-[#8B7A1A] hover:border-[#8B7A1A]'
                  }
                  hover:shadow-xl cursor-pointer bg-white/90 backdrop-blur-sm
                  text-[#5E4E06] font-medium text-base
                `}
              >
                {address.country || 'Select country'}
              </button>
              <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8B7A1A]" />
              <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8B7A1A] transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {isCountryDropdownOpen && (
              <div className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-sm border-2 border-[#D4AF37] rounded-2xl shadow-2xl max-h-80 overflow-hidden">
                <div className="p-4 border-b border-[#D4AF37]/30">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search countries..."
                    className="w-full px-4 py-3 text-base border-2 border-[#D4AF37] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B7A1A]/20 focus:border-[#8B7A1A] bg-white/80 text-[#5E4E06] placeholder:text-[#8B7A1A]"
                    autoFocus
                  />
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => {
                        onChange('country', country.name);
                        setIsCountryDropdownOpen(false);
                        setSearchTerm('');
                      }}
                      className="w-full px-6 py-4 text-left hover:bg-[#F5F2E8] transition-colors duration-200 cursor-pointer"
                    >
                      <div className="font-semibold text-[#5E4E06]">{country.name}</div>
                      <div className="text-sm text-[#8B7A1A]">{country.code}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {errors.country && (
              <p className="mt-2 text-sm text-red-500">{errors.country}</p>
            )}
          </div>

          {/* Address Lines */}
          <div>
            <label className="block text-sm font-semibold text-[#8B7A1A] mb-3">
              Address Line 1 {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
              <input
                type="text"
                value={address.addressLine1}
                onChange={(e) => onChange('addressLine1', e.target.value)}
                className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 transition-all duration-300
                  focus:outline-none focus:ring-4 focus:ring-offset-0
                  ${errors.addressLine1 
                    ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                    : 'border-[#D4AF37] focus:ring-[#8B7A1A]/20 focus:border-[#8B7A1A] hover:border-[#8B7A1A]'
                  }
                  hover:shadow-xl cursor-text bg-white/90 backdrop-blur-sm
                  placeholder:text-[#8B7A1A] placeholder:font-medium text-[#5E4E06] font-medium text-base
                `}
                placeholder="Street address, apartment, suite, etc."
              />
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8B7A1A]" />
            </div>
            {errors.addressLine1 && (
              <p className="mt-2 text-sm text-red-500">{errors.addressLine1}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#8B7A1A] mb-3">
              Address Line 2 (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                value={address.addressLine2}
                onChange={(e) => onChange('addressLine2', e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-[#D4AF37] focus:border-[#8B7A1A] focus:ring-4 focus:ring-[#8B7A1A]/20 transition-all duration-300 hover:shadow-xl cursor-text bg-white/90 backdrop-blur-sm placeholder:text-[#8B7A1A] placeholder:font-medium text-[#5E4E06] font-medium text-base"
                placeholder="Apartment, suite, unit, etc."
              />
              <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8B7A1A]" />
            </div>
          </div>
        </div>
      </div>
      {/* State, City, Postal Code: full width row below both columns */}
      <div className="mt-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-[#8B7A1A] mb-3">
            {getStateLabel(address.country)} {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type="text"
            value={address.state}
            onChange={(e) => onChange('state', e.target.value)}
            className={`w-full px-4 py-4 rounded-2xl border-2 transition-all duration-300
              focus:outline-none focus:ring-4 focus:ring-offset-0
              ${errors.state 
                ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                : 'border-[#D4AF37] focus:ring-[#8B7A1A]/20 focus:border-[#8B7A1A] hover:border-[#8B7A1A]'
              }
              hover:shadow-xl cursor-text bg-white/90 backdrop-blur-sm
              placeholder:text-[#8B7A1A] placeholder:font-medium text-[#5E4E06] font-medium text-base
            `}
            placeholder={getStateLabel(address.country)}
          />
          {errors.state && (
            <p className="mt-2 text-sm text-red-500">{errors.state}</p>
          )}
        </div>
        <div className="flex-1">
          <label className="block text-sm font-semibold text-[#8B7A1A] mb-3">
            City {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type="text"
            value={address.city}
            onChange={(e) => onChange('city', e.target.value)}
            className={`w-full px-4 py-4 rounded-2xl border-2 transition-all duration-300
              focus:outline-none focus:ring-4 focus:ring-offset-0
              ${errors.city 
                ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                : 'border-[#D4AF37] focus:ring-[#8B7A1A]/20 focus:border-[#8B7A1A] hover:border-[#8B7A1A]'
              }
              hover:shadow-xl cursor-text bg-white/90 backdrop-blur-sm
              placeholder:text-[#8B7A1A] placeholder:font-medium text-[#5E4E06] font-medium text-base
            `}
            placeholder="City"
          />
          {errors.city && (
            <p className="mt-2 text-sm text-red-500">{errors.city}</p>
          )}
        </div>
        <div className="flex-1">
          <label className="block text-sm font-semibold text-[#8B7A1A] mb-3">
            {getPostalCodeLabel(address.country)} {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <div className="relative">
            <input
              type="text"
              value={address.postalCode}
              onChange={(e) => onChange('postalCode', e.target.value)}
              className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 transition-all duration-300
                focus:outline-none focus:ring-4 focus:ring-offset-0
                ${errors.postalCode 
                  ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                  : 'border-[#D4AF37] focus:ring-[#8B7A1A]/20 focus:border-[#8B7A1A] hover:border-[#8B7A1A]'
                }
                hover:shadow-xl cursor-text bg-white/90 backdrop-blur-sm
                placeholder:text-[#8B7A1A] placeholder:font-medium text-[#5E4E06] font-medium text-base
              `}
              placeholder={getPostalCodeLabel(address.country)}
            />
            <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8B7A1A]" />
          </div>
          {errors.postalCode && (
            <p className="mt-2 text-sm text-red-500">{errors.postalCode}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UniversalAddressForm; 
"use client";

import React, { useState, useEffect } from 'react';
import { FaDownload, FaQrcode } from 'react-icons/fa';
import { ContactVCard } from '@/types';
import { getContactVCard } from '@/lib/firebase/data-service';

// وظيفة لإنشاء ملف vCard من بيانات الاتصال
const generateVCardData = (contact: ContactVCard): string => {
  // إنشاء بداية الـ vCard
  let vcard = 'BEGIN:VCARD\nVERSION:3.0\n';
  
  // إضافة الاسم
  vcard += `FN:${contact.name}\n`;
  vcard += `N:${contact.name};;;;\n`;
  
  // إضافة العنوان الوظيفي
  if (contact.title) {
    vcard += `TITLE:${contact.title}\n`;
  }
  
  // إضافة الصورة إذا كانت متوفرة
  if (contact.photo) {
    vcard += `PHOTO;VALUE=URI:${contact.photo}\n`;
  }
  
  // إضافة أرقام الهاتف
  if (contact.phones && contact.phones.length > 0) {
    contact.phones.forEach(phone => {
      vcard += `TEL;TYPE=${phone.label || 'CELL'}:${phone.number}\n`;
    });
  }
  
  // إضافة رقم الواتساب
  if (contact.whatsapp) {
    vcard += `TEL;TYPE=WHATSAPP:${contact.whatsapp}\n`;
  }
  
  // إضافة البريد الإلكتروني
  if (contact.email) {
    vcard += `EMAIL:${contact.email}\n`;
  }
  
  // إضافة الموقع الإلكتروني
  if (contact.website) {
    vcard += `URL:${contact.website}\n`;
  }
  
  // إضافة العنوان
  if (contact.address) {
    vcard += `ADR:;;${contact.address};;;;\n`;
  }
  
  // إضافة روابط التواصل الاجتماعي
  if (contact.socialMedia) {
    if (contact.socialMedia.facebook) {
      vcard += `X-SOCIALPROFILE;TYPE=facebook:${contact.socialMedia.facebook}\n`;
    }
    if (contact.socialMedia.twitter) {
      vcard += `X-SOCIALPROFILE;TYPE=twitter:${contact.socialMedia.twitter}\n`;
    }
    if (contact.socialMedia.instagram) {
      vcard += `X-SOCIALPROFILE;TYPE=instagram:${contact.socialMedia.instagram}\n`;
    }
    if (contact.socialMedia.linkedin) {
      vcard += `X-SOCIALPROFILE;TYPE=linkedin:${contact.socialMedia.linkedin}\n`;
    }
    if (contact.socialMedia.youtube) {
      vcard += `X-SOCIALPROFILE;TYPE=youtube:${contact.socialMedia.youtube}\n`;
    }
  }
  
  // إنهاء الـ vCard
  vcard += 'END:VCARD';
  
  return vcard;
};

// المكون الرئيسي
const VCardDownloader: React.FC = () => {
  const [contact, setContact] = useState<ContactVCard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [vCardData, setVCardData] = useState('');
  
  // تحميل بيانات الاتصال عند تهيئة المكون
  useEffect(() => {
    const loadContactData = async () => {
      try {
        setIsLoading(true);
        const data = await getContactVCard();
        
        if (data) {
          setContact(data);
          // إنشاء بيانات vCard
          const vcardString = generateVCardData(data);
          setVCardData(vcardString);
        }
      } catch (error) {
        console.error('خطأ في تحميل بيانات الاتصال:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadContactData();
  }, []);
  
  // وظيفة لتنزيل ملف vCard
  const downloadVCard = () => {
    if (!vCardData) return;
    
    const blob = new Blob([vCardData], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // تكوين رابط التنزيل
    link.href = url;
    link.download = `${contact?.name || 'contact'}.vcf`;
    document.body.appendChild(link);
    
    // تنفيذ التنزيل
    link.click();
    
    // تنظيف
    setTimeout(() => {
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
    }, 100);
  };
  
  return (
    <div className="flex flex-col items-center">
      {isLoading ? (
        <div className="py-2 px-4 bg-blue-500/20 rounded-md animate-pulse">
          <span className="text-white text-sm">جاري التحميل...</span>
        </div>
      ) : !contact ? (
        <div className="py-2 px-4 bg-red-500/20 rounded-md">
          <span className="text-white text-sm">لم يتم العثور على معلومات الاتصال</span>
        </div>
      ) : (
        <div className="space-y-4">
          {/* زر التنزيل المباشر */}
          <button
            onClick={downloadVCard}
            className="py-2 px-4 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white rounded-md flex items-center space-x-2 transition-all hover:shadow-lg hover:shadow-blue-900/30"
          >
            <FaDownload className="ml-2" />
            <span>تنزيل بطاقة الاتصال</span>
          </button>
          
          {/* زر لإظهار رمز QR - تم تعطيله مؤقتاً */}
          <button
            onClick={() => setShowQR(!showQR)}
            className="py-2 px-4 bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-gray-950 text-white rounded-md flex items-center space-x-2 transition-all hover:shadow-lg hover:shadow-gray-900/30"
          >
            <FaQrcode className="ml-2" />
            <span>{showQR ? 'إخفاء وصلة QR' : 'عرض وصلة QR'}</span>
          </button>
          
          {/* عرض رمز QR مبسط */}
          {showQR && vCardData && (
            <div className="p-4 bg-white rounded-lg mt-4 flex flex-col items-center">
              <div className="bg-white p-4 rounded">
                <div className="text-center text-black">
                  {/* رابط بدل من كود QR */}
                  <p className="font-bold mb-2">معلومات الاتصال</p>
                  <p className="text-sm mb-4 text-gray-700">امسح الرمز الشريطي أو انسخ الرابط لإضافة جهة الاتصال</p>
                  <div className="p-3 border border-gray-300 rounded bg-gray-100 mb-2">
                    <code className="text-xs break-all select-all">{vCardData}</code>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VCardDownloader; 
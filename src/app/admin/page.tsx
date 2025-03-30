"use client";
import { useState, useEffect } from "react";
import AuthCheck from "./AuthCheck";
import { FaSave, FaTrash, FaIdCard, FaFacebookSquare, FaTwitterSquare, FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { getContactVCard, saveContactVCard, uploadContactPhoto } from "@/lib/firebase/data-service";
import { ContactVCard } from "@/types";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<string>("mycard");
  const [contactVCardData, setContactVCardData] = useState<ContactVCard | null>(null);
  const [contactVCardLoading, setContactVCardLoading] = useState(false);
  const [contactPhotoFile, setContactPhotoFile] = useState<File | null>(null);
  
  // Load contact vCard data
  const loadContactVCard = async () => {
    try {
      setContactVCardLoading(true);
      const data = await getContactVCard();
      
      if (data) {
        setContactVCardData(data);
      } else {
        // إنشاء بيانات افتراضية
        setContactVCardData({
          name: "كريم السيد",
          title: "مهندس صوت محترف",
          photo: "",
          phones: [{ number: "", label: "موبايل" }],
          isActive: true
        });
      }
    } catch (error) {
      console.error("خطأ في تحميل بيانات بطاقة الاتصال:", error);
    } finally {
      setContactVCardLoading(false);
    }
  };
  
  // Save contact vCard data
  const saveContactVCardData = async () => {
    if (!contactVCardData) return;
    
    try {
      setContactVCardLoading(true);
      
      // رفع الصورة أولاً إذا كانت موجودة
      if (contactPhotoFile) {
        const result = await uploadContactPhoto(contactPhotoFile);
        if ('url' in result) {
          setContactVCardData(prev => prev ? { ...prev, photo: result.url } : null);
        } else {
          toast.error("فشل في رفع الصورة: " + result.error);
          setContactVCardLoading(false);
          return;
        }
      }
      
      // حفظ البيانات
      const result = await saveContactVCard(contactVCardData);
      
      if (result.success) {
        toast.success("تم حفظ بيانات بطاقة الاتصال بنجاح");
        
        // تحديث البيانات المحلية بالمعرف إذا كانت جديدة
        if (result.id && (!contactVCardData.id || contactVCardData.id !== result.id)) {
          setContactVCardData(prev => prev ? { ...prev, id: result.id } : null);
        }
        
        // إعادة تحميل البيانات للتأكد من التحديث
        loadContactVCard();
      } else {
        toast.error("فشل في حفظ بيانات بطاقة الاتصال");
      }
    } catch (error) {
      console.error("خطأ في حفظ بيانات بطاقة الاتصال:", error);
      toast.error("حدث خطأ أثناء حفظ البيانات");
    } finally {
      setContactVCardLoading(false);
      setContactPhotoFile(null);
    }
  };
  
  // Handle contact photo change
  const handleContactPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setContactPhotoFile(e.target.files[0]);
    }
  };
  
  // Add new phone
  const addNewPhone = () => {
    setContactVCardData(prev => {
      if (!prev) return prev;
      
      const updatedPhones = [...(prev.phones || []), { number: "", label: "موبايل" }];
      return { ...prev, phones: updatedPhones };
    });
  };
  
  // Remove phone
  const removePhone = (index: number) => {
    setContactVCardData(prev => {
      if (!prev || !prev.phones) return prev;
      
      const updatedPhones = prev.phones.filter((_, i) => i !== index);
      return { ...prev, phones: updatedPhones };
    });
  };
  
  // Handle phone change
  const handlePhoneChange = (index: number, field: 'number' | 'label', value: string) => {
    setContactVCardData(prev => {
      if (!prev || !prev.phones) return prev;
      
      const updatedPhones = [...prev.phones];
      updatedPhones[index] = {
        ...updatedPhones[index],
        [field]: value
      };
      
      return { ...prev, phones: updatedPhones };
    });
  };
  
  // Load data on mount
  useEffect(() => {
    loadContactVCard();
  }, []);
  
  return (
    <AuthCheck>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white py-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold mb-6">لوحة التحكم</h1>
          
          {/* قسم إدارة بطاقة الاتصال */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white border-r-4 border-blue-500 pr-2">بطاقة الاتصال الخاصة بي</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              أدخل معلومات الاتصال الخاصة بك لإنشاء بطاقة vCard قابلة للتنزيل من خلال الموقع
            </p>
            
            {contactVCardLoading ? (
              <div className="flex justify-center my-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* الجانب الأيمن - المعلومات الأساسية */}
                <div className="space-y-4">
                  {/* الاسم */}
                  <div>
                    <label htmlFor="contact-name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      الاسم الكامل*
                    </label>
                    <input
                      type="text"
                      id="contact-name"
                      value={contactVCardData?.name || ""}
                      onChange={(e) => setContactVCardData(prev => prev ? { ...prev, name: e.target.value } : null)}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                      placeholder="أدخل الاسم الكامل"
                      required
                    />
                  </div>
                  
                  {/* المسمى الوظيفي */}
                  <div>
                    <label htmlFor="contact-title" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      المسمى الوظيفي*
                    </label>
                    <input
                      type="text"
                      id="contact-title"
                      value={contactVCardData?.title || ""}
                      onChange={(e) => setContactVCardData(prev => prev ? { ...prev, title: e.target.value } : null)}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                      placeholder="مثال: مهندس صوت محترف"
                      required
                    />
                  </div>
                  
                  {/* الصورة الشخصية */}
                  <div>
                    <label htmlFor="contact-photo" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      الصورة الشخصية
                    </label>
                    
                    <div className="flex items-center space-x-4 space-x-reverse">
                      {/* عرض الصورة الحالية */}
                      {contactVCardData?.photo && (
                        <div className="relative h-20 w-20 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
                          <Image
                            src={contactVCardData.photo}
                            alt="الصورة الشخصية"
                            fill
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                      )}
                      
                      {/* حقل تحميل الصورة */}
                      <div className="flex-1">
                        <input
                          type="file"
                          id="contact-photo"
                          onChange={handleContactPhotoChange}
                          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                          accept="image/*"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          يفضل صورة مربعة بدقة عالية
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* البريد الإلكتروني */}
                  <div>
                    <label htmlFor="contact-email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      id="contact-email"
                      value={contactVCardData?.email || ""}
                      onChange={(e) => setContactVCardData(prev => prev ? { ...prev, email: e.target.value } : null)}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                      placeholder="example@domain.com"
                    />
                  </div>
                </div>
                
                {/* الجانب الأيسر - أرقام الهواتف ومواقع التواصل */}
                <div className="space-y-4">
                  {/* أرقام الهواتف */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-900 dark:text-white">
                        أرقام الهواتف
                      </label>
                      <button
                        type="button"
                        onClick={addNewPhone}
                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        + إضافة رقم جديد
                      </button>
                    </div>
                    
                    {/* قائمة أرقام الهواتف */}
                    <div className="space-y-3">
                      {contactVCardData?.phones?.map((phone, index) => (
                        <div key={index} className="flex space-x-3 space-x-reverse">
                          {/* نوع الرقم */}
                          <div className="w-1/3">
                            <select
                              value={phone.label}
                              onChange={(e) => handlePhoneChange(index, 'label', e.target.value)}
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                            >
                              <option value="موبايل">موبايل</option>
                              <option value="عمل">عمل</option>
                              <option value="منزل">منزل</option>
                              <option value="فاكس">فاكس</option>
                              <option value="آخر">آخر</option>
                            </select>
                          </div>
                          
                          {/* الرقم */}
                          <div className="flex-1">
                            <input
                              type="tel"
                              value={phone.number}
                              onChange={(e) => handlePhoneChange(index, 'number', e.target.value)}
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                              placeholder="+xxxxxxxxxx"
                            />
                          </div>
                          
                          {/* زر الحذف */}
                          <button
                            type="button"
                            onClick={() => removePhone(index)}
                            className="p-2.5 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            title="حذف الرقم"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      ))}
                      
                      {(!contactVCardData?.phones || contactVCardData.phones.length === 0) && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          لا توجد أرقام هواتف. اضغط على "إضافة رقم جديد" لإضافة رقم.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* زر الحفظ */}
            <div className="mt-8 flex justify-start">
              <button
                type="button"
                onClick={saveContactVCardData}
                disabled={contactVCardLoading}
                className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-600 text-white font-medium shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {contactVCardLoading ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <FaSave className="ml-2" />
                    حفظ بيانات بطاقة الاتصال
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuthCheck>
  );
}

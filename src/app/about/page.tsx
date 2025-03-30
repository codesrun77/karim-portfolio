import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen font-arabic">
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-12">اعرفني</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <div className="relative h-[400px] w-full rounded-lg overflow-hidden shadow-xl">
              <Image
                src="/profile.jpg"
                alt="كريم السيد - مهندس صوت"
                fill
                style={{ objectFit: "cover" }}
                priority
              />
            </div>
            
            <div>
              <h2 className="text-3xl font-bold mb-6">كريم السيد</h2>
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6">
                أنا مهندس صوت محترف، أعمل في مجال الصوت والإعلام منذ عام 2012. تخرجت من المعهد العالي للسينما - قسم هندسة صوت، وأمتلك خبرة واسعة في تسجيل وهندسة الصوت للأفلام والمسلسلات والبرامج التلفزيونية.
              </p>
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6">
                عملت مع العديد من القنوات الفضائية والإنتاجات السينمائية، وأمتلك معرفة عميقة بتقنيات الصوت الحديثة وأدوات المعالجة الصوتية.
              </p>
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                أسعى دائمًا لتطوير مهاراتي ومواكبة أحدث التقنيات في مجال هندسة الصوت، وأؤمن بأن الصوت هو عنصر أساسي في نجاح أي عمل فني أو إعلامي.
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 mb-16">
            <h2 className="text-2xl font-bold mb-6 text-center">فلسفتي</h2>
            <blockquote className="text-center text-xl italic text-gray-700 dark:text-gray-300 leading-relaxed">
              &ldquo;انا مؤمن جدا بان كلنا اتخلقنا علشان يبقي لينا دور وتأثير في الدنيا .. نص مشوار حياتك فانك تعرف ايه هوا هدفك بالظبط والنص التاني انك تحاول تحقق وتوصل لهدفك. دلوقتي انا في نص المشوار التاني وهكمل لحد محقق كل اهدافي باذن الله&rdquo;
            </blockquote>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">المهارات التقنية</h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>تسجيل الصوت الاحترافي</li>
                <li>مكساج وماسترينغ</li>
                <li>تصميم الصوت للأفلام</li>
                <li>معالجة الصوت الرقمية</li>
                <li>إنتاج الموسيقى التصويرية</li>
                <li>توزيع الصوت المحيطي</li>
              </ul>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">البرامج والأدوات</h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>Pro Tools</li>
                <li>Logic Pro</li>
                <li>Ableton Live</li>
                <li>Nuendo</li>
                <li>Adobe Audition</li>
                <li>Waves Plugins</li>
              </ul>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">الاهتمامات</h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>تطوير تقنيات الصوت</li>
                <li>الإذاعة والبث الصوتي</li>
                <li>الموسيقى والتوزيع</li>
                <li>البودكاست</li>
                <li>تقنيات الواقع الافتراضي الصوتية</li>
                <li>الصوت المحيطي</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 
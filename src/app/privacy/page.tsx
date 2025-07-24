"use client";
import Link from "next/link";
import { ArrowLeft, Eye, Lock, Shield, User, Database, Bell, Globe } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <title>Gizlilik Politikası - Preluvia</title>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-black transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Ana Sayfaya Dön
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Eye className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Gizlilik Politikası</h1>
            <p className="text-gray-600">Kişisel Verilerinizin Korunması ve Kullanımı</p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="w-6 h-6 mr-3 text-green-600" />
                1. Giriş
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Preluvia olarak, gizliliğinizi korumaya ve kişisel verilerinizi güvenli bir şekilde 
                işlemeye büyük önem veriyoruz. Bu gizlilik politikası, web sitemizi kullanırken 
                hangi bilgileri topladığımızı, nasıl kullandığımızı ve koruduğumuzu açıklar.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-6 h-6 mr-3 text-green-600" />
                2. Topladığımız Bilgiler
              </h2>
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">2.1 Doğrudan Verdiğiniz Bilgiler</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Ad, soyad ve e-posta adresi</li>
                  <li>Telefon numarası ve adres bilgileri</li>
                  <li>Hesap oluşturma ve giriş bilgileri</li>
                  <li>Sipariş ve ödeme bilgileri</li>
                  <li>İletişim formları aracılığıyla gönderilen mesajlar</li>
                </ul>

                <h3 className="text-lg font-medium text-gray-900">2.2 Otomatik Olarak Toplanan Bilgiler</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>IP adresi ve tarayıcı bilgileri</li>
                  <li>Çerezler ve benzer teknolojiler</li>
                  <li>Site kullanım istatistikleri</li>
                  <li>Cihaz bilgileri ve işletim sistemi</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Database className="w-6 h-6 mr-3 text-green-600" />
                3. Bilgilerin Kullanımı
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700">Topladığımız bilgileri aşağıdaki amaçlarla kullanırız:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Hesabınızın oluşturulması ve yönetimi</li>
                  <li>Siparişlerinizin işlenmesi ve takibi</li>
                  <li>Müşteri hizmetleri ve destek sağlanması</li>
                  <li>Ürün ve hizmetlerimizin iyileştirilmesi</li>
                  <li>Güvenlik ve dolandırıcılık önleme</li>
                  <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                  <li>İzin verdiğiniz takdirde pazarlama faaliyetleri</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Lock className="w-6 h-6 mr-3 text-green-600" />
                4. Bilgi Güvenliği
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Kişisel verilerinizi korumak için aşağıdaki güvenlik önlemlerini uygularız:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>SSL şifreleme teknolojisi kullanımı</li>
                  <li>Güvenli veri depolama sistemleri</li>
                  <li>Düzenli güvenlik denetimleri</li>
                  <li>Erişim kontrolü ve yetkilendirme</li>
                  <li>Veri yedekleme ve felaket kurtarma planları</li>
                  <li>Personel güvenlik eğitimleri</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Globe className="w-6 h-6 mr-3 text-green-600" />
                5. Çerezler ve Benzer Teknolojiler
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Web sitemizde çerezler ve benzer teknolojiler kullanırız. Bu teknolojiler:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li><strong>Zorunlu Çerezler:</strong> Sitenin temel işlevleri için gerekli</li>
                  <li><strong>Analitik Çerezler:</strong> Site kullanımını analiz etmek için</li>
                  <li><strong>Fonksiyonel Çerezler:</strong> Kullanıcı tercihlerini hatırlamak için</li>
                  <li><strong>Pazarlama Çerezleri:</strong> Reklam ve pazarlama amaçlı (izin gerekli)</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  Tarayıcı ayarlarınızdan çerezleri kontrol edebilir veya silebilirsiniz.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Bell className="w-6 h-6 mr-3 text-green-600" />
                6. Pazarlama İletişimi
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Size özel teklifler, yeni ürünler ve kampanyalar hakkında bilgi göndermek için 
                e-posta adresinizi kullanabiliriz. Bu tür iletişimler için her zaman açık rızanızı 
                alırız ve istediğiniz zaman bu iletişimleri durdurabilirsiniz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Üçüncü Taraf Hizmetler</h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Hizmetlerimizi sağlamak için aşağıdaki üçüncü taraf hizmet sağlayıcılarıyla çalışırız:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Ödeme işlemcileri (güvenli ödeme için)</li>
                  <li>Kargo şirketleri (sipariş teslimatı için)</li>
                  <li>Analitik hizmetleri (site performansını ölçmek için)</li>
                  <li>E-posta hizmetleri (iletişim için)</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  Bu hizmet sağlayıcıları, sadece hizmetlerimizi sağlamak için gerekli bilgilere 
                  erişir ve kendi gizlilik politikalarına tabidir.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Çocukların Gizliliği</h2>
              <p className="text-gray-700 leading-relaxed">
                Hizmetlerimiz 18 yaş ve üzeri kullanıcılar için tasarlanmıştır. Bilerek 18 yaş 
                altındaki kişilerden kişisel bilgi toplamayız. Eğer bir çocuğun bilgilerini 
                yanlışlıkla topladığımızı fark edersek, bu bilgileri derhal sileriz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Haklarınız</h2>
              <p className="text-gray-700 mb-4">Kişisel verilerinizle ilgili aşağıdaki haklara sahipsiniz:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Kişisel verilerinize erişim hakkı</li>
                <li>Yanlış veya eksik verilerin düzeltilmesini isteme hakkı</li>
                <li>Verilerinizin silinmesini isteme hakkı</li>
                <li>Veri işlemeyi kısıtlama hakkı</li>
                <li>Veri taşınabilirliği hakkı</li>
                <li>İtiraz etme hakkı</li>
                <li>Pazarlama iletişimlerini durdurma hakkı</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. İletişim</h2>
              <p className="text-gray-700 leading-relaxed">
                Gizlilik politikamızla ilgili sorularınız için bizimle iletişime geçebilirsiniz:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700"><strong>E-posta:</strong> privacy@preluvia.com</p>
                <p className="text-gray-700"><strong>Adres:</strong> [Şirket Adresi]</p>
                <p className="text-gray-700"><strong>Telefon:</strong> [Telefon Numarası]</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Değişiklikler</h2>
              <p className="text-gray-700 leading-relaxed">
                Bu gizlilik politikası zaman zaman güncellenebilir. Önemli değişiklikler olduğunda 
                sizi bilgilendireceğiz. Güncel politika her zaman web sitemizde yayınlanacaktır.
              </p>
            </section>

            <div className="text-center pt-8 border-t">
              <p className="text-sm text-gray-500">
                Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
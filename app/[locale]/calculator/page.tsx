
import { prisma } from '@/lib/db';
import { getTranslations } from '@/lib/i18n/server';
import Header from '@/components/header';
import VdotCalculator from '@/components/vdot-calculator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Target, Activity } from 'lucide-react';

export const dynamic = "force-dynamic";

async function getVdotData() {
  const vdotTable = await prisma.vdotTable.findMany({
    orderBy: { vdot: 'asc' }
  });
  
  return vdotTable;
}

export default async function CalculatorPage({ params }: { params: { locale: string } }) {
  const vdotData = await getVdotData();
  const t = await getTranslations(params.locale, 'calculator');

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      <Header />
      
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">
            <span className="bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
              {t('title')}
            </span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>

        {/* VDOT Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Calculator className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <h3 className="font-semibold mb-2">{t('vdotLevel')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('vdotLevelDesc')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-orange-100 rounded-full">
                  <Target className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <h3 className="font-semibold mb-2">{t('goalTitle')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('goalDesc')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-green-100 rounded-full">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <h3 className="font-semibold mb-2">{t('zonesTitle')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('zonesDesc')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Calculator */}
        <VdotCalculator vdotData={vdotData} />

        {/* Pace Zones Explanation */}
        <Card className="transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 mt-8">
          <CardHeader>
            <CardTitle>{t('understandingTitle')}</CardTitle>
            <CardDescription>
              {t('understandingDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-2 text-blue-800">{t('ePaceTitle')}</h4>
                  <p className="text-sm text-blue-700">
                    {t('ePaceDesc')}
                  </p>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-semibold mb-2 text-orange-800">{t('mPaceTitle')}</h4>
                  <p className="text-sm text-orange-700">
                    {t('mPaceDesc')}
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold mb-2 text-green-800">{t('tPaceTitle')}</h4>
                  <p className="text-sm text-green-700">
                    {t('tPaceDesc')}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-semibold mb-2 text-red-800">{t('iPaceTitle')}</h4>
                  <p className="text-sm text-red-700">
                    {t('iPaceDesc')}
                  </p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold mb-2 text-purple-800">{t('rPaceTitle')}</h4>
                  <p className="text-sm text-purple-700">
                    {t('rPaceDesc')}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">{t('distribution8020Title')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('distribution8020Desc')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}


import { prisma } from '@/lib/db';
import Header from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import SearchableGlossary from '@/components/searchable-glossary';
import { BookOpen, Search, Target, Apple, Activity } from 'lucide-react';
import { useLocale, useTranslations } from '@/lib/i18n/hooks';

export const dynamic = "force-dynamic";

async function getGlossaryData() {
  const terms = await prisma.glossary.findMany({
    orderBy: { term: 'asc' }
  });

  const groupedTerms = terms.reduce((acc, term) => {
    if (!acc[term.category]) {
      acc[term.category] = [];
    }
    acc[term.category].push(term);
    return acc;
  }, {} as Record<string, typeof terms>);

  return { terms, groupedTerms };
}

const categoryInfo = {
  treino: {
    name: "Treinamento",
    description: "Termos relacionados aos tipos de treino e metodologias",
    color: "bg-blue-100 text-blue-800",
    icon: Activity
  },
  fisiologia: {
    name: "Fisiologia",
    description: "Conceitos sobre funcionamento do corpo durante o exercício",
    color: "bg-green-100 text-green-800", 
    icon: Target
  },
  nutricao: {
    name: "Nutrição",
    description: "Terminologia nutricional e estratégias alimentares",
    color: "bg-orange-100 text-orange-800",
    icon: Apple
  }
};

export default async function GlossaryPage() {
  const { terms, groupedTerms } = await getGlossaryData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      <Header />
      
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Glossário de Termos
            </span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Entenda a terminologia essencial do treinamento de maratona.
            De paces e zonas de treino até conceitos nutricionais avançados.
          </p>
        </div>

        {/* Categories Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {Object.entries(categoryInfo).map(([key, info]) => {
            const Icon = info.icon;
            const categoryCount = groupedTerms[key]?.length || 0;
            
            return (
              <Card key={key} className="text-center">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-3">
                    <div className="p-3 bg-gray-100 rounded-full">
                      <Icon className="h-6 w-6 text-gray-600" />
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2">{info.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{info.description}</p>
                  <Badge className={info.color}>
                    {categoryCount} termos
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Searchable Glossary */}
        <SearchableGlossary terms={terms} groupedTerms={groupedTerms} />

        {/* Quick Reference */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Referência Rápida: Paces VDOT 37-38
            </CardTitle>
            <CardDescription>
              Seus paces de treino baseados no perfil atual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium">Easy Pace</span>
                  <Badge className="bg-blue-100 text-blue-800">6:15-6:45/km</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="font-medium">Marathon Pace</span>
                  <Badge className="bg-orange-100 text-orange-800">5:41-5:51/km</Badge>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Threshold Pace</span>
                  <Badge className="bg-green-100 text-green-800">5:15-5:25/km</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="font-medium">Interval Pace</span>
                  <Badge className="bg-red-100 text-red-800">4:50-5:00/km</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

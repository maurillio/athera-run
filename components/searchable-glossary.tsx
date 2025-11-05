
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen } from 'lucide-react';

interface GlossaryTerm {
  id: number;
  term: string;
  definition: string;
  category: string;
  examples: string | null;
}

interface SearchableGlossaryProps {
  terms: GlossaryTerm[];
  groupedTerms: Record<string, GlossaryTerm[]>;
}

const categoryColors: Record<string, string> = {
  treino: "bg-blue-100 text-blue-800",
  fisiologia: "bg-green-100 text-green-800",
  nutricao: "bg-orange-100 text-orange-800"
};

export default function SearchableGlossary({ terms, groupedTerms }: SearchableGlossaryProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTerms = terms?.filter(term =>
    term?.term?.toLowerCase().includes(searchTerm?.toLowerCase() || '') ||
    term?.definition?.toLowerCase().includes(searchTerm?.toLowerCase() || '')
  ) ?? [];

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Termos
          </CardTitle>
          <CardDescription>
            Digite um termo ou conceito para encontrar sua definição
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Ex: VDOT, carb loading, longão..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {searchTerm ? (
          <>
            <h3 className="text-lg font-semibold">
              Resultados da busca "{searchTerm}" ({filteredTerms.length} encontrados)
            </h3>
            
            {filteredTerms.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nenhum termo encontrado. Tente uma busca diferente.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredTerms.map((term) => (
                  <Card key={term.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{term.term}</CardTitle>
                        <Badge className={categoryColors[term.category] || "bg-gray-100 text-gray-800"}>
                          {term.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-3">{term.definition}</p>
                      {term.examples && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium">Exemplo: </span>
                          <span className="text-sm text-muted-foreground">{term.examples}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold">Todos os Termos ({terms?.length || 0})</h3>
            
            {Object.entries(groupedTerms).map(([category, categoryTerms]) => (
              <div key={category} className="space-y-3">
                <h4 className="font-medium text-base capitalize flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  {category} ({categoryTerms?.length || 0} termos)
                </h4>
                
                <div className="grid grid-cols-1 gap-3">
                  {categoryTerms?.map((term) => (
                    <Card key={term.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{term.term}</CardTitle>
                          <Badge className={categoryColors[term.category] || "bg-gray-100 text-gray-800"}>
                            {term.category}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground mb-2">{term.definition}</p>
                        {term.examples && (
                          <div className="p-2 bg-gray-50 rounded text-xs">
                            <span className="font-medium">Exemplo: </span>
                            <span className="text-muted-foreground">{term.examples}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

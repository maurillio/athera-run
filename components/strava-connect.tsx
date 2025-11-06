
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, ExternalLink, Info, RefreshCw, Loader2, Crown } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePremium } from '@/hooks/use-premium';
import PaywallModal from '@/components/subscription/paywall-modal';
import { useTranslations } from '@/lib/i18n/hooks';

interface StravaConnectProps {
  profile: {
    id: number;
    stravaConnected: boolean;
    stravaAthleteId: string | null;
  };
}

export default function StravaConnect({ profile }: StravaConnectProps) {
  const t = useTranslations('strava');
  const [isImporting, setIsImporting] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const { isPremium, loading: premiumLoading } = usePremium();

  const handleConnect = () => {
    if (!isPremium) {
      setShowPaywall(true);
      return;
    }
    // Redirecionar para OAuth do Strava
    window.location.href = '/api/strava/auth';
  };

  const handleImportHistory = async () => {
    if (!isPremium) {
      setShowPaywall(true);
      return;
    }

    if (!confirm(t('confirmImport'))) return;

    setIsImporting(true);

    try {
      const response = await fetch('/api/strava/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: profile.id, daysBack: 90 })
      });

      const data = await response.json();

      if (response.ok) {
        alert(t('importSuccess', { imported: data.imported, skipped: data.skipped, total: data.total }));
        window.location.reload();
      } else {
        alert(t('importError'));
      }
    } catch (error) {
      console.error('Erro ao importar:', error);
      alert(t('importError'));
    } finally {
      setIsImporting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm(t('confirmDisconnect'))) return;
    
    try {
      const response = await fetch('/api/strava/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ athleteId: profile.id })
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Erro ao desconectar:', error);
    }
  };

  return (
    <>
    <Card className="mb-8 border-2 border-orange-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <svg className="h-6 w-6 text-orange-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/>
              </svg>
              {t('title')}
              {!isPremium && (
                <Crown className="h-4 w-4 text-orange-500 ml-1" />
              )}
            </CardTitle>
            <CardDescription>
              {t('description')}
            </CardDescription>
          </div>
          
          {profile.stravaConnected ? (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {t('connected')}
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-gray-100 text-gray-800">
              <XCircle className="h-3 w-3 mr-1" />
              {t('notConnected')}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {!profile.stravaConnected ? (
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {t('setupInfo')}
                <br />
                <a
                  href="https://developers.strava.com/docs/getting-started/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center gap-1 mt-2"
                >
                  {t('setupLink')}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleConnect}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              {t('connect')}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>{t('autoImportInfo')}</span>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm text-blue-800">
                  <strong>{t('syncActiveTitle')}</strong> {t('syncActiveDesc')}
                </AlertDescription>
              </Alert>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleImportHistory}
                disabled={isImporting}
                variant="outline"
                className="flex-1"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('importing')}
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {t('importHistory')}
                  </>
                )}
              </Button>

              <Button
                onClick={handleDisconnect}
                variant="destructive"
              >
                {t('disconnect')}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>

    <PaywallModal
      isOpen={showPaywall}
      onClose={() => setShowPaywall(false)}
      feature={t('paywallFeature')}
      description={t('paywallDescription')}
    />
    </>
  );
}

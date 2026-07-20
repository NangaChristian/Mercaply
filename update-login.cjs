const fs = require('fs');
let content = fs.readFileSync('src/pages/auth/LoginPage.tsx', 'utf-8');

const mfaState = `  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  // MFA States
  const [showMfaVerify, setShowMfaVerify] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [factorId, setFactorId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);`;

content = content.replace("  const [showPassword, setShowPassword] = useState(false);\n  const [isLoading, setIsLoading] = useState(false);\n  const [isGoogleLoading, setIsGoogleLoading] = useState(false);", mfaState);


const onSubmitLogic = `    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Erreur de connexion');

      // Check MFA Status
      const { data: mfaData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      
      if (mfaData?.nextLevel === 'aal2' && mfaData.nextLevel !== mfaData.currentLevel) {
        const { data: factors } = await supabase.auth.mfa.listFactors();
        const totpFactor = factors.totp[0];
        
        if (totpFactor) {
          setFactorId(totpFactor.id);
          setShowMfaVerify(true);
          return; // Stop here and show MFA form
        }
      }

      addToast('success', 'Connexion réussie');
      navigate(from, { replace: true });
    } catch (error: any) {`;

content = content.replace(/    try \{\s*const \{ data: authData, error: authError \} = await supabase.auth.signInWithPassword\(\{\s*email: data.email,\s*password: data.password,\s*\}\);\s*if \(authError\) throw authError;\s*if \(\!authData.user\) throw new Error\('Erreur de connexion'\);\s*addToast\('success', 'Connexion réussie'\);\s*navigate\(from, \{ replace: true \}\);\s*\} catch \(error: any\) \{/, onSubmitLogic);

const mfaVerifyMethod = `
  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId || mfaCode.length < 6) return;
    
    setIsVerifying(true);
    try {
      const challengeResponse = await supabase.auth.mfa.challenge({ factorId });
      if (challengeResponse.error) throw challengeResponse.error;
      
      const verifyResponse = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeResponse.data.id,
        code: mfaCode
      });
      
      if (verifyResponse.error) throw verifyResponse.error;
      
      addToast('success', 'Connexion réussie');
      navigate(from, { replace: true });
    } catch (error: any) {
      addToast('error', error.message || 'Code MFA invalide');
    } finally {
      setIsVerifying(false);
    }
  };

  return (`;

content = content.replace("  return (", mfaVerifyMethod);

const renderContent = `        <Card className="p-8">
          {showMfaVerify ? (
            <form onSubmit={handleVerifyMfa} className="space-y-6">
              <div className="text-center mb-6">
                <Lock className="h-12 w-12 text-accent mx-auto mb-4" />
                <h3 className="text-lg font-bold text-text-primary">Vérification en deux étapes</h3>
                <p className="text-sm text-text-secondary mt-2">
                  Entrez le code à 6 chiffres généré par votre application d'authentification.
                </p>
              </div>
              <Input
                label="Code d'authentification"
                type="text"
                placeholder="123456"
                maxLength={6}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/[^0-9]/g, ''))}
                className="text-center tracking-[0.5em] font-mono text-xl"
              />
              <Button type="submit" className="w-full" isLoading={isVerifying} disabled={mfaCode.length !== 6}>
                Vérifier
              </Button>
              <button 
                type="button" 
                onClick={() => { setShowMfaVerify(false); setMfaCode(''); }}
                className="w-full text-sm text-text-secondary hover:text-text-primary transition-colors mt-4"
              >
                Retour à la connexion
              </button>
            </form>
          ) : (
            <>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">`;

content = content.replace(`        <Card className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">`, renderContent);

const closingRender = `          </p>
            </>
          )}
        </Card>`;

content = content.replace(`          </p>
        </Card>`, closingRender);


fs.writeFileSync('src/pages/auth/LoginPage.tsx', content, 'utf-8');

import React from 'react';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/stores/gameStore';
import { ArrowLeft, Star, Zap, Crown, Gift, Sparkles, Heart, Lightbulb } from 'lucide-react';

const ShopScreen: React.FC = () => {
  const { 
    setCurrentScreen, 
    player, 
    addHints,
    addBrainStars,
    spendBrainStars,
    unlockPremium,
    premium
  } = useGameStore();

  const handleBackClick = () => {
    setCurrentScreen('home');
  };

  const handlePurchase = (item: string, cost: number) => {
    if (player.brainStars >= cost) {
      spendBrainStars(cost);
      
      switch (item) {
        case 'hints_5':
          addHints(5);
          break;
        case 'hints_10':
          addHints(10);
          break;
        case 'hints_25':
          addHints(25);
          break;
        case 'stars_100':
          addBrainStars(100);
          break;
        case 'stars_500':
          addBrainStars(500);
          break;
        case 'premium':
          unlockPremium();
          break;
      }
    }
  };

  const shopItems = [
    {
      id: 'hints_5',
      name: '5 Hints',
      description: 'Get helpful tips for tricky puzzles',
      cost: 50,
      icon: <Lightbulb className="w-8 h-8 text-warning" />,
      category: 'consumables'
    },
    {
      id: 'hints_10',
      name: '10 Hints',
      description: 'Never get stuck again!',
      cost: 90,
      icon: <Lightbulb className="w-8 h-8 text-warning" />,
      category: 'consumables',
      popular: true
    },
    {
      id: 'hints_25',
      name: '25 Hints',
      description: 'Ultimate hint package',
      cost: 200,
      icon: <Lightbulb className="w-8 h-8 text-warning" />,
      category: 'consumables'
    },
    {
      id: 'stars_100',
      name: '100 Brain Stars',
      description: 'Bonus currency pack',
      cost: 0, // Free daily reward
      icon: <Star className="w-8 h-8 text-warning" />,
      category: 'currency',
      free: true
    },
    {
      id: 'stars_500',
      name: '500 Brain Stars',
      description: 'Mega currency pack',
      cost: 100,
      icon: <Star className="w-8 h-8 text-warning" />,
      category: 'currency'
    },
    {
      id: 'premium',
      name: 'Premium Pass',
      description: 'Remove ads, unlock exclusive content, bonus rewards',
      cost: 500,
      icon: <Crown className="w-8 h-8 text-warning" />,
      category: 'premium',
      special: true
    }
  ];

  const categories = [
    { id: 'consumables', name: 'Power-ups', icon: <Zap className="w-5 h-5" /> },
    { id: 'currency', name: 'Currency', icon: <Star className="w-5 h-5" /> },
    { id: 'premium', name: 'Premium', icon: <Crown className="w-5 h-5" /> }
  ];

  return (
    <div className="fixed inset-0 bg-gradient-mystery game-ui">
      {/* UI Container */}
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6">
          <Button
            variant="outline"
            size="lg"
            onClick={handleBackClick}
          >
            <ArrowLeft className="mr-2" />
            Back
          </Button>

          <h1 className="text-2xl font-bold text-transparent bg-gradient-cosmic bg-clip-text">
            BrainShop
          </h1>

          <div className="bg-card/90 backdrop-blur-sm rounded-xl p-3 shadow-cosmic">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-warning" />
              <span className="text-sm font-bold">{player.brainStars}</span>
            </div>
          </div>
        </div>

        {/* Premium Status */}
        {premium.isUnlocked && (
          <div className="mx-6 mb-4">
            <div className="bg-gradient-cosmic p-4 rounded-xl shadow-cosmic">
              <div className="flex items-center justify-center gap-2">
                <Crown className="w-6 h-6 text-warning" />
                <span className="text-lg font-bold">Premium Member</span>
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <p className="text-center text-sm text-muted-foreground mt-2">
                Enjoy ad-free gaming and exclusive content!
              </p>
            </div>
          </div>
        )}

        {/* Shop Categories */}
        <div className="flex-1 overflow-y-auto p-6">
          {categories.map((category) => {
            const categoryItems = shopItems.filter(item => item.category === category.id);
            
            return (
              <div key={category.id} className="mb-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  {category.icon}
                  {category.name}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className={`relative bg-card/90 backdrop-blur-sm rounded-xl p-6 shadow-cosmic transition-all duration-300 hover:scale-105 ${
                        item.special ? 'ring-2 ring-warning' : ''
                      } ${
                        item.popular ? 'ring-2 ring-primary' : ''
                      }`}
                    >
                      {item.popular && (
                        <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                          POPULAR
                        </div>
                      )}
                      
                      {item.free && (
                        <div className="absolute -top-2 -right-2 bg-success text-success-foreground text-xs font-bold px-2 py-1 rounded-full">
                          FREE
                        </div>
                      )}

                      {item.special && (
                        <div className="absolute -top-2 -left-2 bg-warning text-warning-foreground text-xs font-bold px-2 py-1 rounded-full">
                          PREMIUM
                        </div>
                      )}

                      {/* Item Icon */}
                      <div className="flex justify-center mb-4">
                        {item.icon}
                      </div>

                      {/* Item Info */}
                      <h3 className="text-lg font-bold text-center mb-2">{item.name}</h3>
                      <p className="text-sm text-muted-foreground text-center mb-4">
                        {item.description}
                      </p>

                      {/* Price and Purchase */}
                      <div className="text-center">
                        {item.free ? (
                          <div className="text-success font-bold mb-3">FREE</div>
                        ) : (
                          <div className="flex items-center justify-center gap-1 mb-3">
                            <Star className="w-4 h-4 text-warning" />
                            <span className="text-lg font-bold">{item.cost}</span>
                          </div>
                        )}

                        <Button
                          variant={item.special ? 'premium' : item.popular ? 'cosmic' : 'energy'}
                          size="sm"
                          className="w-full"
                          onClick={() => handlePurchase(item.id, item.cost)}
                          disabled={!item.free && player.brainStars < item.cost}
                        >
                          {item.free ? (
                            <>
                              <Gift className="mr-2 w-4 h-4" />
                              Claim
                            </>
                          ) : player.brainStars < item.cost ? (
                            'Not Enough Stars'
                          ) : (
                            <>
                              <Star className="mr-2 w-4 h-4" />
                              Buy
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Current Inventory */}
        <div className="p-6 bg-card/90 backdrop-blur-sm">
          <h3 className="text-lg font-bold mb-4 text-center">Your Inventory</h3>
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="text-center">
              <div className="bg-muted rounded-lg p-3 mb-2">
                <Lightbulb className="w-6 h-6 text-warning mx-auto" />
              </div>
              <div className="text-sm font-bold">{player.hints}</div>
              <div className="text-xs text-muted-foreground">Hints</div>
            </div>
            
            <div className="text-center">
              <div className="bg-muted rounded-lg p-3 mb-2">
                <Star className="w-6 h-6 text-warning mx-auto" />
              </div>
              <div className="text-sm font-bold">{player.brainStars}</div>
              <div className="text-xs text-muted-foreground">Brain Stars</div>
            </div>
            
            <div className="text-center">
              <div className="bg-muted rounded-lg p-3 mb-2">
                <Heart className="w-6 h-6 text-anger mx-auto" />
              </div>
              <div className="text-sm font-bold">∞</div>
              <div className="text-xs text-muted-foreground">Lives</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center p-4">
          <p className="text-sm text-muted-foreground">
            Earn Brain Stars by completing levels and daily challenges!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShopScreen;
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, UserCircle, Sparkle, ShoppingCart, CalendarCheck, ChartBar } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface AnimatedAppDemoProps {
  className?: string;
}

const ANIMATION_SCENES = [
  {
    id: 'profile',
    duration: 4000,
    title: 'Create Your Profile',
    subtitle: 'Set budget, dietary preferences, and meal goals',
    render: () => (
      <div className="space-y-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-card border-2 border-primary/20 rounded-2xl p-6 space-y-4 shadow-lg"
        >
          <div className="flex items-center gap-3 pb-3 border-b">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <UserCircle weight="fill" className="w-8 h-8 text-primary" />
            </div>
            <div>
              <div className="font-bold text-sm">Profile Setup</div>
              <div className="text-xs text-muted-foreground">Step 1 of 4</div>
            </div>
          </div>
          
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <div className="text-xs font-medium text-muted-foreground">Budget</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary tabular-nums">€50</span>
              <span className="text-sm text-muted-foreground">/ week</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-2"
          >
            <div className="text-xs font-medium text-muted-foreground">Meal Plan</div>
            <div className="text-sm"><span className="font-bold">7 days</span> • <span className="font-bold">3 meals</span> per day</div>
          </motion.div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="space-y-2"
          >
            <div className="text-xs font-medium text-muted-foreground">Preferences</div>
            <div className="flex flex-wrap gap-2">
              {['Vegetarian', 'Gluten-Free', 'High Protein'].map((pref, i) => (
                <motion.span
                  key={pref}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.9 + i * 0.1, type: 'spring' }}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
                >
                  {pref}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="text-xs text-center text-muted-foreground"
        >
          💡 AI tailors meals to your budget & preferences
        </motion.div>
      </div>
    ),
  },
  {
    id: 'generate',
    duration: 3500,
    title: 'AI Generates Your Plan',
    subtitle: 'Smart meal selection with nutrition & cost calculation',
    render: () => (
      <div className="space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="relative w-24 h-24 mx-auto"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary"
          />
          <div className="absolute inset-0 flex items-center justify-center text-4xl">
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              🍽️
            </motion.span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          {[
            { label: 'Analyzing budget', emoji: '💰' },
            { label: 'Selecting recipes', emoji: '👨‍🍳' },
            { label: 'Calculating nutrition', emoji: '📊' },
            { label: 'Optimizing costs', emoji: '✨' },
          ].map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.3 }}
              className="flex items-center gap-3 text-sm"
            >
              <span className="text-lg">{step.emoji}</span>
              <span className="text-muted-foreground">{step.label}</span>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 + i * 0.3 }}
                className="ml-auto w-5 h-5 rounded-full bg-accent flex items-center justify-center"
              >
                <div className="w-2 h-2 rounded-full bg-accent-foreground" />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="text-xs text-center text-muted-foreground"
        >
          🤖 Powered by AI
        </motion.div>
      </div>
    ),
  },
  {
    id: 'mealplan',
    duration: 4500,
    title: 'Your Meal Plan Ready',
    subtitle: 'Complete meals with costs, nutrition & ingredients',
    render: () => (
      <div className="space-y-3">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 border border-primary/20 rounded-xl p-4 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary">Budget Status</span>
            <span className="text-lg font-bold text-primary tabular-nums">€43.50 / €50</span>
          </div>
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '87%' }}
              transition={{ duration: 1.2, delay: 0.3 }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent rounded-full"
            />
          </div>
          <div className="text-xs text-muted-foreground">Under budget by €6.50 ✓</div>
        </motion.div>

        <div className="space-y-2">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xs font-medium text-muted-foreground px-1"
          >
            Day 1 - Monday
          </motion.div>
          {[
            { name: 'Greek Yogurt Bowl', type: 'Breakfast', cal: 420, cost: 3.2, protein: 28 },
            { name: 'Chickpea Curry', type: 'Lunch', cal: 580, cost: 4.5, protein: 22 },
            { name: 'Quinoa Salad', type: 'Dinner', cal: 380, cost: 3.8, protein: 16 },
          ].map((meal, i) => (
            <motion.div
              key={meal.name}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 + i * 0.2, type: 'spring', stiffness: 100 }}
              className="bg-card border rounded-xl p-3 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{meal.name}</div>
                  <div className="text-xs text-muted-foreground">{meal.type}</div>
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <span className="tabular-nums">{meal.cal} cal</span>
                    <span className="tabular-nums">{meal.protein}g protein</span>
                  </div>
                </div>
                <div className="text-base font-bold text-primary tabular-nums shrink-0">
                  €{meal.cost.toFixed(2)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2"
        >
          <Sparkle weight="fill" className="w-3 h-3" />
          <span>6 more days ready to view</span>
        </motion.div>
      </div>
    ),
  },
  {
    id: 'features',
    duration: 4000,
    title: 'Powerful Features',
    subtitle: 'Everything you need for meal planning success',
    render: () => (
      <div className="space-y-3">
        {[
          {
            icon: <ShoppingCart weight="fill" className="w-6 h-6" />,
            title: 'Shopping List',
            desc: 'Auto-generated with quantities & costs',
            color: 'from-blue-500/10 to-blue-600/10 border-blue-500/30',
            iconColor: 'text-blue-600'
          },
          {
            icon: <CalendarCheck weight="fill" className="w-6 h-6" />,
            title: 'Track Progress',
            desc: 'Schedule meals & mark as complete',
            color: 'from-purple-500/10 to-purple-600/10 border-purple-500/30',
            iconColor: 'text-purple-600'
          },
          {
            icon: <ChartBar weight="fill" className="w-6 h-6" />,
            title: 'Meal Prep',
            desc: 'Batch cooking recommendations',
            color: 'from-green-500/10 to-green-600/10 border-green-500/30',
            iconColor: 'text-green-600'
          },
          {
            icon: <Sparkle weight="fill" className="w-6 h-6" />,
            title: 'Smart Swaps',
            desc: 'Replace meals you don\'t like',
            color: 'from-amber-500/10 to-amber-600/10 border-amber-500/30',
            iconColor: 'text-amber-600'
          },
        ].map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.25, type: 'spring', stiffness: 100 }}
            className={cn(
              'flex items-center gap-4 p-4 rounded-xl border-2 bg-gradient-to-br shadow-sm hover:shadow-md transition-all',
              feature.color
            )}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: i * 0.25 + 0.2, type: 'spring', stiffness: 200 }}
              className={cn('shrink-0', feature.iconColor)}
            >
              {feature.icon}
            </motion.div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm">{feature.title}</div>
              <div className="text-xs text-muted-foreground">{feature.desc}</div>
            </div>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-xs text-center text-muted-foreground pt-2"
        >
          ✨ And much more...
        </motion.div>
      </div>
    ),
  },
];

export function AnimatedAppDemo({ className }: AnimatedAppDemoProps) {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;

    const scene = ANIMATION_SCENES[currentScene];
    const timer = setTimeout(() => {
      setCurrentScene((prev) => (prev + 1) % ANIMATION_SCENES.length);
    }, scene.duration);

    return () => clearTimeout(timer);
  }, [currentScene, isPlaying]);

  const scene = ANIMATION_SCENES[currentScene];
  const progress = ((currentScene + 1) / ANIMATION_SCENES.length) * 100;

  return (
    <Card className={cn('overflow-hidden border-2 shadow-lg', className)}>
      <div className="p-6 md:p-8 bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <div className="text-xs font-bold text-primary uppercase tracking-wider">
                Step {currentScene + 1} of {ANIMATION_SCENES.length}
              </div>
              <div className="h-1 w-12 bg-primary/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
            <h3 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
              {scene.title}
            </h3>
            <p className="text-sm text-muted-foreground">{scene.subtitle}</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsPlaying(!isPlaying)}
            className="rounded-full shrink-0 ml-4"
          >
            {isPlaying ? <Pause weight="fill" /> : <Play weight="fill" />}
          </Button>
        </div>

        <div className="min-h-[280px] md:min-h-[320px] flex items-center justify-center px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={scene.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-md"
            >
              {scene.render()}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-2">
            {ANIMATION_SCENES.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentScene(index);
                  setIsPlaying(false);
                }}
                className={cn(
                  'h-2 flex-1 rounded-full transition-all duration-300',
                  index === currentScene
                    ? 'bg-primary shadow-sm'
                    : index < currentScene
                    ? 'bg-primary/50'
                    : 'bg-muted hover:bg-muted-foreground/30'
                )}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                const prev = currentScene === 0 ? ANIMATION_SCENES.length - 1 : currentScene - 1;
                setCurrentScene(prev);
                setIsPlaying(false);
              }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              ← Previous
            </button>
            <span className="text-xs text-muted-foreground font-medium">
              See how Gurmaio works
            </span>
            <button
              onClick={() => {
                setCurrentScene((prev) => (prev + 1) % ANIMATION_SCENES.length);
                setIsPlaying(false);
              }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}

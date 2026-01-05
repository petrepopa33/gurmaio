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
      <div className="space-y-2">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-card border-2 border-primary/20 rounded-xl p-3 space-y-2.5 shadow-lg"
        >
          <div className="flex items-center gap-2 pb-2 border-b">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <UserCircle weight="fill" className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="font-bold text-xs">Profile Setup</div>
              <div className="text-[10px] text-muted-foreground">Step 1 of 4</div>
            </div>
          </div>
          
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-1"
          >
            <div className="text-[10px] font-medium text-muted-foreground">Budget</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-primary tabular-nums">€50</span>
              <span className="text-xs text-muted-foreground">/ week</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-1"
          >
            <div className="text-[10px] font-medium text-muted-foreground">Meal Plan</div>
            <div className="text-xs"><span className="font-bold">7 days</span> • <span className="font-bold">3 meals</span> per day</div>
          </motion.div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="space-y-1"
          >
            <div className="text-[10px] font-medium text-muted-foreground">Preferences</div>
            <div className="flex flex-wrap gap-1.5">
              {['Vegetarian', 'Gluten-Free', 'High Protein'].map((pref, i) => (
                <motion.span
                  key={pref}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.9 + i * 0.1, type: 'spring' }}
                  className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-medium"
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
          className="text-[10px] text-center text-muted-foreground"
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
      <div className="space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="relative w-16 h-16 mx-auto"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-3 border-primary/20 border-t-primary"
          />
          <div className="absolute inset-0 flex items-center justify-center text-3xl">
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
          className="space-y-2"
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
              className="flex items-center gap-2 text-xs"
            >
              <span className="text-base">{step.emoji}</span>
              <span className="text-muted-foreground">{step.label}</span>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 + i * 0.3 }}
                className="ml-auto w-4 h-4 rounded-full bg-accent flex items-center justify-center"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-accent-foreground" />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="text-[10px] text-center text-muted-foreground"
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
      <div className="space-y-2">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 border border-primary/20 rounded-lg p-3 space-y-1.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-primary">Budget Status</span>
            <span className="text-sm font-bold text-primary tabular-nums">€43.50 / €50</span>
          </div>
          <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '87%' }}
              transition={{ duration: 1.2, delay: 0.3 }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent rounded-full"
            />
          </div>
          <div className="text-[10px] text-muted-foreground">Under budget by €6.50 ✓</div>
        </motion.div>

        <div className="space-y-1.5">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-[10px] font-medium text-muted-foreground px-0.5"
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
              className="bg-card border rounded-lg p-2 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs truncate">{meal.name}</div>
                  <div className="text-[10px] text-muted-foreground">{meal.type}</div>
                  <div className="flex items-center gap-2 mt-1 text-[10px]">
                    <span className="tabular-nums">{meal.cal} cal</span>
                    <span className="tabular-nums">{meal.protein}g protein</span>
                  </div>
                </div>
                <div className="text-xs font-bold text-primary tabular-nums shrink-0">
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
          className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground pt-1"
        >
          <Sparkle weight="fill" className="w-2.5 h-2.5" />
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
      <div className="space-y-2">
        {[
          {
            icon: <ShoppingCart weight="fill" className="w-5 h-5" />,
            title: 'Shopping List',
            desc: 'Auto-generated with quantities & costs',
            color: 'from-blue-500/10 to-blue-600/10 border-blue-500/30',
            iconColor: 'text-blue-600'
          },
          {
            icon: <CalendarCheck weight="fill" className="w-5 h-5" />,
            title: 'Track Progress',
            desc: 'Schedule meals & mark as complete',
            color: 'from-purple-500/10 to-purple-600/10 border-purple-500/30',
            iconColor: 'text-purple-600'
          },
          {
            icon: <ChartBar weight="fill" className="w-5 h-5" />,
            title: 'Meal Prep',
            desc: 'Batch cooking recommendations',
            color: 'from-green-500/10 to-green-600/10 border-green-500/30',
            iconColor: 'text-green-600'
          },
          {
            icon: <Sparkle weight="fill" className="w-5 h-5" />,
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
              'flex items-center gap-3 p-2.5 rounded-lg border-2 bg-gradient-to-br shadow-sm hover:shadow-md transition-all',
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
              <div className="font-bold text-xs">{feature.title}</div>
              <div className="text-[10px] text-muted-foreground">{feature.desc}</div>
            </div>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-[10px] text-center text-muted-foreground pt-1"
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
      <div className="p-4 md:p-5 bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-0.5 flex-1">
            <div className="flex items-center gap-2">
              <div className="text-[10px] font-bold text-primary uppercase tracking-wider">
                Step {currentScene + 1} of {ANIMATION_SCENES.length}
              </div>
              <div className="h-0.5 w-8 bg-primary/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
            <h3 className="font-heading text-lg md:text-xl font-bold text-foreground">
              {scene.title}
            </h3>
            <p className="text-xs text-muted-foreground">{scene.subtitle}</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsPlaying(!isPlaying)}
            className="rounded-full shrink-0 ml-3 h-8 w-8"
          >
            {isPlaying ? <Pause weight="fill" size={14} /> : <Play weight="fill" size={14} />}
          </Button>
        </div>

        <div className="min-h-[200px] md:min-h-[220px] flex items-center justify-center px-2">
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

        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-1.5">
            {ANIMATION_SCENES.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentScene(index);
                  setIsPlaying(false);
                }}
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-all duration-300',
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
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              ← Previous
            </button>
            <span className="text-[10px] text-muted-foreground font-medium">
              See how Gurmaio works
            </span>
            <button
              onClick={() => {
                setCurrentScene((prev) => (prev + 1) % ANIMATION_SCENES.length);
                setIsPlaying(false);
              }}
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}

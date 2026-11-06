import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <section className="section-padding">
      <div className="container-wide flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="size-16 mx-auto rounded-2xl bg-brand-orange/10 flex items-center justify-center mb-6">
            <Wrench className="size-8 text-brand-orange" />
          </div>
          <p className="font-display font-bold text-6xl text-foreground tabular-nums">404</p>
          <h1 className="text-2xl font-display font-bold text-foreground mt-3">This pipe leads nowhere</h1>
          <p className="text-muted-foreground mt-3">
            The page you're looking for doesn't exist or has been moved. Let's get you back to solid ground.
          </p>
          <div className="flex items-center justify-center gap-3 mt-8">
            <Button asChild className="bg-brand-orange hover:bg-brand-orange-dark text-white font-display font-semibold">
              <Link to="/"><Home className="size-4 mr-2" /> Back to Home</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/services">Browse Services</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

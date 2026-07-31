import { Injectable, Logger } from '@nestjs/common';

export interface SituationContext {
  situation: string;
  detectedOccasion: string;
  detectedSeason: string;
  detectedWeather: string;
  detectedLocation: string;
  detectedClimate: string;
  detectedDressCode: string;
  detectedBudget: string;
  detectedGender: string;
  detectedAgeGroup: string;
  detectedProfession: string;
  detectedPersonalStyle: string;
  detectedUrgency: string;
  detectedDuration: string;
  detectedParticipants: string[];
  detectedCulturalContext: string;
  detectedFormalityLevel: string;
  detectedSetting: string;
  detectedTone: string;
}

export interface SituationAnalysis {
  context: SituationContext;
  outfitComponents: OutfitComponent[];
  accessories: Accessory[];
  grooming: GroomingSuggestion[];
  budgetBreakdown: BudgetItem[];
  alternatives: Alternative[];
  buyingPriority: BuyingPriority[];
  expertAdvice: ExpertAdvice[];
  explanation: string;
  reasoning: ReasoningStep[];
}

export interface OutfitComponent {
  category: string;
  item: string;
  color: string;
  fabric: string;
  style: string;
  brand: string;
  estimatedPrice: number;
  essential: boolean;
  priority: 'must_have' | 'recommended' | 'optional';
  whyThis: string;
}

export interface Accessory {
  category: string;
  item: string;
  color: string;
  material: string;
  style: string;
  brand: string;
  estimatedPrice: number;
  essential: boolean;
  whyThis: string;
}

export interface GroomingSuggestion {
  category: string;
  suggestion: string;
  product: string;
  estimatedPrice: number;
  whyThis: string;
}

export interface BudgetItem {
  category: string;
  item: string;
  minPrice: number;
  maxPrice: number;
  recommendedPrice: number;
  priority: number;
  notes: string;
}

export interface Alternative {
  type: 'premium' | 'budget' | 'fusion' | 'traditional';
  outfit: OutfitComponent[];
  totalBudget: number;
  savings: number;
  bestFor: string;
}

export interface BuyingPriority {
  item: string;
  priority: number;
  deadline: string;
  reason: string;
  quickLinks: string[];
}

export interface ExpertAdvice {
  expert: string;
  advice: string;
  perspective: string;
}

export interface ReasoningStep {
  step: number;
  thought: string;
  conclusion: string;
}

@Injectable()
export class SituationIntelligenceService {
  private readonly logger = new Logger(SituationIntelligenceService.name);

  // Comprehensive situation patterns
  private readonly situationPatterns: Record<string, any> = {
    // Wedding & Ceremonies
    wedding: {
      occasions: ['wedding', 'shaadi', 'marriage', 'bride', 'groom'],
      dressCodes: ['ethnic', 'traditional', 'formal'],
      formality: 'very_high',
      budget: 'medium_to_high',
    },
    reception: {
      occasions: ['reception', 'reception party'],
      dressCodes: ['ethnic', 'semi-formal'],
      formality: 'high',
      budget: 'medium',
    },
    engagement: {
      occasions: ['engagement', 'ring ceremony'],
      dressCodes: ['ethnic', 'semi-formal'],
      formality: 'high',
      budget: 'medium',
    },
    haldi: {
      occasions: ['haldi', 'turmeric ceremony', 'pithi'],
      dressCodes: ['ethnic', 'comfortable'],
      formality: 'casual_to_medium',
      budget: 'low',
      colors: ['yellow', 'turmeric', 'white'],
    },
    mehendi: {
      occasions: ['mehendi', 'mendhi'],
      dressCodes: ['ethnic', 'comfortable'],
      formality: 'medium',
      budget: 'low',
      colors: ['green', 'yellow', 'peach'],
    },
    sangeet: {
      occasions: ['sangeet', 'sangeet night'],
      dressCodes: ['ethnic', 'party'],
      formality: 'medium_to_high',
      budget: 'medium',
      colors: ['bright', 'festive'],
    },

    // Office & Professional
    interview: {
      occasions: ['interview', 'job interview', 'placement'],
      dressCodes: ['formal', 'business'],
      formality: 'very_high',
      budget: 'medium',
      colors: ['black', 'navy', 'grey', 'white'],
    },
    first_day: {
      occasions: ['first day', 'joining', 'new job'],
      dressCodes: ['smart_casual', 'business_casual'],
      formality: 'medium',
      budget: 'low_to_medium',
      colors: ['neutral', 'subtle'],
    },
    presentation: {
      occasions: ['presentation', 'client meeting'],
      dressCodes: ['formal', 'business'],
      formality: 'high',
      budget: 'medium',
    },
    corporate_event: {
      occasions: ['corporate event', 'company event', 'team event'],
      dressCodes: ['smart_casual', 'business_casual'],
      formality: 'medium',
      budget: 'low_to_medium',
    },

    // College & Education
    fresher: {
      occasions: ['fresher', 'freshers party', 'orientation'],
      dressCodes: ['casual', 'trendy'],
      formality: 'low_to_medium',
      budget: 'low',
      ageGroup: 'young_adult',
    },
    farewell: {
      occasions: ['farewell', 'graduation day', 'passing out'],
      dressCodes: ['semi-formal', 'ethnic'],
      formality: 'medium_to_high',
      budget: 'medium',
    },
    college_daily: {
      occasions: ['college', 'classes', 'university', 'daily wear'],
      dressCodes: ['casual', 'comfortable'],
      formality: 'low',
      budget: 'low',
      ageGroup: 'young_adult',
    },

    // Festivals & Celebrations
    diwali: {
      occasions: ['diwali', 'deepavali', 'festival'],
      dressCodes: ['ethnic', 'festive'],
      formality: 'medium_to_high',
      budget: 'medium_to_high',
      colors: ['bright', 'gold', 'red', 'orange'],
    },
    eid: {
      occasions: ['eid', 'eid-ul-fitr', 'eid-ul-adha'],
      dressCodes: ['ethnic', 'traditional'],
      formality: 'high',
      budget: 'medium_to_high',
      colors: ['white', 'pastel', 'embroidery'],
    },
    christmas: {
      occasions: ['christmas', 'xmas'],
      dressCodes: ['festive', 'casual'],
      formality: 'low_to_medium',
      budget: 'low',
      colors: ['red', 'green', 'white'],
    },

    // Travel & Vacation
    beach_vacation: {
      occasions: ['beach', 'beach vacation', 'sea', 'coastal'],
      dressCodes: ['casual', 'tropical'],
      formality: 'very_low',
      budget: 'low',
      weather: 'hot',
      colors: ['bright', 'tropical', 'white'],
    },
    mountain_trip: {
      occasions: ['mountain', 'hills', 'trekking', 'camping'],
      dressCodes: ['adventure', 'practical'],
      formality: 'very_low',
      budget: 'low_to_medium',
      weather: 'cold',
      colors: ['earth tones', 'dark colors'],
    },
    honeymoon: {
      occasions: ['honeymoon', 'romantic getaway'],
      dressCodes: ['romantic', 'casual', 'elegant'],
      formality: 'low_to_high',
      budget: 'high',
      colors: ['romantic', 'pastel'],
    },
    business_trip: {
      occasions: ['business trip', 'work travel'],
      dressCodes: ['business', 'smart_casual'],
      formality: 'high',
      budget: 'medium',
      colors: ['neutral', 'professional'],
    },
    international_trip: {
      occasions: ['international', 'abroad', 'overseas'],
      dressCodes: ['versatile', 'practical'],
      formality: 'varied',
      budget: 'medium',
    },

    // Sports & Fitness
    gym: {
      occasions: ['gym', 'workout', 'fitness', 'exercise'],
      dressCodes: ['athletic', 'sportswear'],
      formality: 'very_low',
      budget: 'low',
      activities: ['gym', 'workout'],
    },
    yoga: {
      occasions: ['yoga', 'meditation', 'wellness'],
      dressCodes: ['comfortable', 'stretchy'],
      formality: 'very_low',
      budget: 'low',
      colors: ['calm', 'neutral'],
    },
    running: {
      occasions: ['running', 'marathon', 'jogging'],
      dressCodes: ['athletic', 'performance'],
      formality: 'very_low',
      budget: 'low',
      activities: ['running'],
    },
    cricket: {
      occasions: ['cricket', 'sports'],
      dressCodes: ['sportswear'],
      formality: 'very_low',
      budget: 'low',
      activities: ['cricket'],
    },

    // Home & Living
    home_office: {
      occasions: ['home office', 'wfh', 'work from home'],
      dressCodes: ['comfortable', 'smart_casual'],
      formality: 'low',
      budget: 'low',
      setting: 'home',
    },
    study_room: {
      occasions: ['study', 'study room', 'exam preparation'],
      dressCodes: ['comfortable', 'casual'],
      formality: 'very_low',
      budget: 'low',
      setting: 'home',
    },
    living_room: {
      occasions: ['living room', 'lounge', 'family gathering'],
      dressCodes: ['comfortable', 'casual'],
      formality: 'very_low',
      budget: 'low',
      setting: 'home',
    },

    // Special Occasions
    date_night: {
      occasions: ['date', 'romantic dinner', 'date night'],
      dressCodes: ['smart', 'elegant'],
      formality: 'medium_to_high',
      budget: 'medium',
      colors: ['romantic', 'dark', 'red'],
    },
    concert: {
      occasions: ['concert', 'music festival', 'live show'],
      dressCodes: ['trendy', 'casual', 'bold'],
      formality: 'low_to_medium',
      budget: 'low_to_medium',
      colors: ['bold', 'dark'],
    },
    birthday: {
      occasions: ['birthday', 'party'],
      dressCodes: ['party', 'festive'],
      formality: 'low_to_high',
      budget: 'varied',
    },

    // Gaming & Tech
    gaming_setup: {
      occasions: ['gaming', 'esports', 'gaming setup'],
      dressCodes: ['casual', 'comfortable'],
      formality: 'very_low',
      budget: 'medium_to_high',
      setting: 'indoor',
    },
    streaming: {
      occasions: ['streaming', 'twitch', 'youtube'],
      dressCodes: ['casual', 'branded'],
      formality: 'very_low',
      budget: 'low_to_medium',
    },
    photography: {
      occasions: ['photography', 'photoshoot', 'camera'],
      dressCodes: ['stylish', 'solid colors'],
      formality: 'varied',
      budget: 'medium',
    },
    content_creation: {
      occasions: ['content creation', 'vlogging', 'influencer'],
      dressCodes: ['stylish', 'on_trend'],
      formality: 'low_to_medium',
      budget: 'medium',
    },

    // Family & Life Events
    baby_shower: {
      occasions: ['baby shower', 'expecting'],
      dressCodes: ['soft', 'comfortable'],
      formality: 'medium',
      budget: 'low',
      colors: ['pastel', 'pink', 'blue', 'yellow'],
    },
    first_job: {
      occasions: ['first job', 'starting career'],
      dressCodes: ['business_casual', 'formal'],
      formality: 'high',
      budget: 'medium',
    },
    retirement: {
      occasions: ['retirement', 'retiring'],
      dressCodes: ['comfortable', 'smart casual'],
      formality: 'medium',
      budget: 'low_to_medium',
      ageGroup: 'senior',
    },

    // Religious & Cultural
    temple: {
      occasions: ['temple', 'religious visit', 'pooja'],
      dressCodes: ['traditional', 'modest'],
      formality: 'high',
      budget: 'low_to_medium',
      colors: ['white', 'pastel', 'traditional'],
    },
    housewarming: {
      occasions: ['housewarming', 'griha pravesh', 'new home'],
      dressCodes: ['festive', 'ethnic'],
      formality: 'medium_to_high',
      budget: 'medium',
    },

    // Adventure & Activities
    trekking: {
      occasions: ['trekking', 'hiking', 'adventure'],
      dressCodes: ['adventure', 'practical'],
      formality: 'very_low',
      budget: 'medium',
      weather: 'varied',
    },
    cycling: {
      occasions: ['cycling', 'biking'],
      dressCodes: ['athletic', 'sportswear'],
      formality: 'very_low',
      budget: 'low_to_medium',
    },
    swimming: {
      occasions: ['swimming', 'pool', 'beach activities'],
      dressCodes: ['swimwear'],
      formality: 'very_low',
      budget: 'low',
    },

    // Daily & Casual
    daily_wear: {
      occasions: ['daily', 'casual', 'everyday'],
      dressCodes: ['casual', 'comfortable'],
      formality: 'very_low',
      budget: 'low',
    },
    weekend: {
      occasions: ['weekend', 'off day'],
      dressCodes: ['casual', 'relaxed'],
      formality: 'very_low',
      budget: 'low',
    },
  };

  // Season patterns
  private readonly seasonPatterns = {
    summer: ['summer', 'hot', 'hot weather', 'heat', 'may', 'june', 'july'],
    monsoon: ['monsoon', 'rainy', 'rain', 'rainy season', 'july', 'august', 'september'],
    autumn: ['autumn', 'fall', 'post monsoon', 'october', 'november'],
    winter: ['winter', 'cold', 'chilly', 'december', 'january', 'february'],
    spring: ['spring', 'pleasant', 'march', 'april', 'may'],
  };

  // Weather patterns
  private readonly weatherPatterns = {
    hot: ['hot', 'sunny', 'heat', 'scorching'],
    cold: ['cold', 'chilly', 'freezing', 'snow'],
    rainy: ['rainy', 'rain', 'wet', 'monsoon'],
    humid: ['humid', 'humidity', 'sticky'],
    pleasant: ['pleasant', 'cool', 'mild', 'comfortable'],
  };

  // Color recommendations by occasion
  private readonly occasionColors: Record<string, string[]> = {
    wedding: ['red', 'maroon', 'gold', 'burgundy', 'navy'],
    festive: ['bright red', 'gold', 'orange', 'yellow', 'green'],
    formal: ['black', 'navy', 'grey', 'white', 'charcoal'],
    casual: ['blue', 'white', 'pastels', 'earth tones'],
    party: ['black', 'red', 'sequin', 'metallic', 'bold'],
    romantic: ['red', 'black', 'pink', 'burgundy', 'rose'],
    sports: ['bright', 'performance colors', 'neon'],
    beach: ['white', 'tropical prints', 'pastels', 'bright'],
    religious: ['white', 'pastel', 'cream', 'light colors'],
    interview: ['black', 'navy', 'grey', 'white', 'beige'],
  };

  // Fabric recommendations by season
  private readonly seasonFabrics: Record<string, string[]> = {
    summer: ['cotton', 'linen', 'chambray', 'rayon', 'seersucker'],
    monsoon: ['cotton', 'quick-dry', 'synthetic blends', 'nylon'],
    winter: ['wool', 'fleece', 'cashmere', 'velvet', 'corduroy'],
    spring: ['cotton', 'linen', 'light wool', 'blends'],
    autumn: ['cotton', 'light wool', 'flannel', 'denim'],
  };

  // Budget ranges by occasion
  private readonly budgetRanges: Record<string, { min: number; max: number; recommended: number }> = {
    daily_wear: { min: 500, max: 3000, recommended: 1500 },
    casual_party: { min: 2000, max: 8000, recommended: 4000 },
    formal_event: { min: 5000, max: 20000, recommended: 10000 },
    wedding: { min: 10000, max: 50000, recommended: 25000 },
    interview: { min: 5000, max: 15000, recommended: 8000 },
    sports: { min: 1000, max: 8000, recommended: 3000 },
    travel: { min: 5000, max: 25000, recommended: 12000 },
    festival: { min: 3000, max: 15000, recommended: 7000 },
  };

  // Expert perspectives by situation type
  private readonly expertPerspectives: Record<string, { expert: string; advice: string }[]> = {
    wedding: [
      { expert: '👗 Fashion Consultant', advice: 'Invest in quality ethnic wear - it can be reused for multiple occasions' },
      { expert: '💰 Budget Planner', advice: 'Allocate 60% for main outfit, 25% for accessories, 15% for backup' },
      { expert: '🎨 Personal Stylist', advice: 'Coordinate colors with family members if attending together' },
    ],
    interview: [
      { expert: '💼 Career Advisor', advice: 'First impressions matter - dress slightly more formal than the company culture' },
      { expert: '👔 Style Expert', advice: 'Keep accessories minimal - let your confidence speak' },
      { expert: '💰 Budget Planner', advice: 'Invest in quality basics that work for multiple interviews' },
    ],
    travel: [
      { expert: '🎒 Travel Expert', advice: 'Pack versatile pieces that create multiple outfits' },
      { expert: '👗 Fashion Consultant', advice: 'Choose wrinkle-resistant fabrics for travel' },
      { expert: '💰 Budget Planner', advice: 'Factor in laundry costs vs. packing more clothes' },
    ],
  };

  async analyzeSituation(query: string, userContext?: any): Promise<SituationAnalysis> {
    this.logger.log(`Analyzing situation: ${query}`);

    // Step 1: Detect the situation
    const situation = this.detectSituation(query);

    // Step 2: Extract context
    const context = this.extractContext(query, situation, userContext);

    // Step 3: Generate outfit components
    const outfitComponents = this.generateOutfitComponents(context, situation);

    // Step 4: Suggest accessories
    const accessories = this.suggestAccessories(context, situation);

    // Step 5: Provide grooming suggestions
    const grooming = this.suggestGrooming(context, situation);

    // Step 6: Create budget breakdown
    const budgetBreakdown = this.createBudgetBreakdown(context, situation);

    // Step 7: Generate alternatives
    const alternatives = this.generateAlternatives(context, situation, budgetBreakdown);

    // Step 8: Determine buying priority
    const buyingPriority = this.determineBuyingPriority(context, situation, outfitComponents);

    // Step 9: Generate expert advice
    const expertAdvice = this.generateExpertAdvice(situation, context);

    // Step 10: Build explanation
    const explanation = this.buildExplanation(context, situation, outfitComponents);

    // Step 11: Document reasoning
    const reasoning = this.documentReasoning(context, situation);

    return {
      context,
      outfitComponents,
      accessories,
      grooming,
      budgetBreakdown,
      alternatives,
      buyingPriority,
      expertAdvice,
      explanation,
      reasoning,
    };
  }

  private detectSituation(query: string): string {
    const queryLower = query.toLowerCase();

    // Check each situation pattern
    for (const [situation, pattern] of Object.entries(this.situationPatterns)) {
      for (const keyword of pattern.occasions) {
        if (queryLower.includes(keyword)) {
          return situation;
        }
      }
    }

    // Default to custom situation
    return 'custom';
  }

  private extractContext(query: string, situation: string, userContext?: any): SituationContext {
    const queryLower = query.toLowerCase();

    // Detect season
    let detectedSeason = userContext?.season || 'all_season';
    for (const [season, patterns] of Object.entries(this.seasonPatterns)) {
      if (patterns.some(p => queryLower.includes(p))) {
        detectedSeason = season;
        break;
      }
    }

    // Detect weather
    let detectedWeather = 'pleasant';
    for (const [weather, patterns] of Object.entries(this.weatherPatterns)) {
      if (patterns.some(p => queryLower.includes(p))) {
        detectedWeather = weather;
        break;
      }
    }

    // Detect location
    const locations = ['goa', 'kerala', 'mumbai', 'delhi', 'bangalore', 'hyderabad', 'shimla', 'manali', 'darjeeling', 'rajasthan', 'udaipur', 'jaipur', 'europe', 'dubai', 'bali', 'thailand', 'singapore', 'usa', 'uk'];
    let detectedLocation = '';
    for (const loc of locations) {
      if (queryLower.includes(loc)) {
        detectedLocation = loc;
        break;
      }
    }

    // Detect budget from query
    let detectedBudget = 'medium';
    if (queryLower.includes('budget') || queryLower.includes('cheap') || queryLower.includes('affordable')) {
      detectedBudget = 'low';
    } else if (queryLower.includes('premium') || queryLower.includes('luxury') || queryLower.includes('expensive')) {
      detectedBudget = 'high';
    }

    // Detect urgency
    let detectedUrgency = 'medium';
    if (queryLower.includes('urgent') || queryLower.includes('asap') || queryLower.includes('immediately')) {
      detectedUrgency = 'high';
    } else if (queryLower.includes('planning') || queryLower.includes('future') || queryLower.includes('later')) {
      detectedUrgency = 'low';
    }

    // Detect duration
    let detectedDuration = 'single_day';
    if (queryLower.includes('week') || queryLower.includes('7 day') || queryLower.includes('weeklong')) {
      detectedDuration = 'week';
    } else if (queryLower.includes('month') || queryLower.includes('long trip')) {
      detectedDuration = 'month';
    }

    // Detect participants
    const participantPatterns = [
      { pattern: 'solo', participants: ['myself'] },
      { pattern: 'alone', participants: ['myself'] },
      { pattern: 'with friends', participants: ['myself', 'friends'] },
      { pattern: 'with family', participants: ['myself', 'family'] },
      { pattern: 'with girlfriend', participants: ['myself', 'girlfriend'] },
      { pattern: 'with boyfriend', participants: ['myself', 'boyfriend'] },
      { pattern: 'with wife', participants: ['myself', 'wife'] },
      { pattern: 'with husband', participants: ['myself', 'husband'] },
      { pattern: 'with colleagues', participants: ['myself', 'colleagues'] },
    ];
    let detectedParticipants = ['myself'];
    for (const { pattern, participants } of participantPatterns) {
      if (queryLower.includes(pattern)) {
        detectedParticipants = participants;
        break;
      }
    }

    // Get pattern defaults
    const pattern = this.situationPatterns[situation] || {};

    return {
      situation,
      detectedOccasion: pattern.occasions?.[0] || query,
      detectedSeason,
      detectedWeather,
      detectedLocation,
      detectedClimate: this.inferClimate(detectedLocation),
      detectedDressCode: pattern.dressCodes?.[0] || 'casual',
      detectedBudget,
      detectedGender: userContext?.gender || 'not_specified',
      detectedAgeGroup: userContext?.lifeStage || 'adult',
      detectedProfession: userContext?.profession || '',
      detectedPersonalStyle: userContext?.stylePreferences?.join(', ') || '',
      detectedUrgency,
      detectedDuration,
      detectedParticipants,
      detectedCulturalContext: pattern.occasions?.[0] || '',
      detectedFormalityLevel: pattern.formality || 'varied',
      detectedSetting: this.detectSetting(queryLower),
      detectedTone: this.detectTone(queryLower),
    };
  }

  private inferClimate(location: string): string {
    const tropical = ['goa', 'kerala', 'mumbai', 'singapore', 'bali', 'thailand', 'dubai'];
    const cold = ['shimla', 'manali', 'darjeeling', 'kashmir', 'sSwitzerland', 'norway'];
    const moderate = ['delhi', 'bangalore', 'hyderabad', 'jaipur', 'udaipur'];

    if (tropical.some(l => location.includes(l))) return 'tropical';
    if (cold.some(l => location.includes(l))) return 'cold';
    if (moderate.some(l => location.includes(l))) return 'moderate';
    return 'moderate';
  }

  private detectSetting(query: string): string {
    if (query.includes('office') || query.includes('corporate')) return 'office';
    if (query.includes('home') || query.includes('house')) return 'home';
    if (query.includes('beach') || query.includes('outdoor')) return 'outdoor';
    if (query.includes('restaurant') || query.includes('hotel')) return 'indoor_public';
    return 'varied';
  }

  private detectTone(query: string): string {
    if (query.includes('formal') || query.includes('business')) return 'formal';
    if (query.includes('casual') || query.includes('relaxed')) return 'casual';
    if (query.includes('party') || query.includes('celebration')) return 'celebration';
    return 'neutral';
  }

  private generateOutfitComponents(context: SituationContext, situation: string): OutfitComponent[] {
    const components: OutfitComponent[] = [];
    const colors = this.occasionColors[situation] || this.occasionColors.casual;
    const fabrics = this.seasonFabrics[context.detectedSeason] || ['cotton'];
    const isMen = context.detectedGender === 'male' || !context.detectedGender;
    const isTraditional = context.detectedDressCode.includes('ethnic') || context.detectedDressCode.includes('traditional');

    // Top
    if (isTraditional) {
      components.push({
        category: 'Top',
        item: isMen ? 'Kurta' : (situation.includes('wedding') ? 'Anarkali' : 'Kurti'),
        color: colors[0],
        fabric: fabrics[0],
        style: 'Traditional',
        brand: '',
        estimatedPrice: this.getPrice('top'),
        essential: true,
        priority: 'must_have',
        whyThis: `Traditional attire is expected for ${situation} occasions. The ${colors[0]} color complements the festive atmosphere.`,
      });
    } else {
      components.push({
        category: 'Top',
        item: isMen ? 'Shirt/Polo' : 'Blouse/Top',
        color: colors[0],
        fabric: fabrics[0],
        style: context.detectedDressCode,
        brand: '',
        estimatedPrice: this.getPrice('top'),
        essential: true,
        priority: 'must_have',
        whyThis: `A ${colors[0]} ${fabrics[0]} top is versatile and appropriate for ${context.detectedDressCode} settings.`,
      });
    }

    // Bottom
    if (isMen) {
      if (isTraditional) {
        components.push({
          category: 'Bottom',
          item: situation.includes('wedding') ? 'Churidar' : 'Pyjama',
          color: 'Matching or contrasting',
          fabric: fabrics[0],
          style: 'Traditional',
          brand: '',
          estimatedPrice: this.getPrice('bottom'),
          essential: true,
          priority: 'must_have',
          whyThis: 'Traditional bottoms complement ethnic tops perfectly.',
        });
      } else {
        components.push({
          category: 'Bottom',
          item: context.detectedDressCode === 'formal' ? 'Trousers' : 'Chinos/Jeans',
          color: colors[1] || 'neutral',
          fabric: 'Cotton blend',
          style: context.detectedDressCode,
          brand: '',
          estimatedPrice: this.getPrice('bottom'),
          essential: true,
          priority: 'must_have',
          whyThis: 'Appropriate bottom wear completes the outfit while maintaining comfort.',
        });
      }
    }

    // Outerwear (if needed)
    if (context.detectedSeason === 'winter' || context.detectedWeather === 'cold') {
      components.push({
        category: 'Outerwear',
        item: situation === 'formal' ? 'Blazer' : 'Jacket/Sweater',
        color: 'Navy or Charcoal',
        fabric: context.detectedSeason === 'winter' ? 'Wool' : 'Cotton blend',
        style: context.detectedDressCode,
        brand: '',
        estimatedPrice: this.getPrice('outerwear'),
        essential: context.detectedSeason === 'winter',
        priority: context.detectedSeason === 'winter' ? 'must_have' : 'recommended',
        whyThis: `Essential for ${context.detectedSeason} weather. Layering adds both warmth and style.`,
      });
    }

    // Footwear
    const footwearItem = this.getFootwearForSituation(situation, context);
    components.push({
      category: 'Footwear',
      item: footwearItem.item,
      color: footwearItem.color,
      fabric: 'Leather/Synthetic',
      style: footwearItem.style,
      brand: '',
      estimatedPrice: this.getPrice('footwear'),
      essential: true,
      priority: 'must_have',
      whyThis: footwearItem.whyThis,
    });

    // Occasion-specific items
    if (situation === 'wedding' || situation === 'reception') {
      components.push({
        category: 'Special',
        item: isMen ? 'Sherwani/Nehru Jacket' : 'Lehenga/Saree',
        color: colors[0],
        fabric: 'Silk/Embroidered',
        style: 'Festive',
        brand: '',
        estimatedPrice: this.getPrice('premium'),
        essential: true,
        priority: 'must_have',
        whyThis: 'The main attraction piece for wedding ceremonies. Invest in quality embroidery.',
      });
    }

    return components;
  }

  private getFootwearForSituation(situation: string, context: SituationContext): any {
    const footwearMap: Record<string, any> = {
      wedding: { item: 'Mojaris/Juttis', color: 'Gold or Matching', style: 'Traditional', whyThis: 'Traditional footwear complements ethnic wear beautifully.' },
      interview: { item: 'Formal Shoes/Oxford', color: 'Black or Brown', style: 'Formal', whyThis: 'Polished shoes create a professional impression.' },
      gym: { item: 'Sports Shoes', color: 'Black/White', style: 'Athletic', whyThis: 'Proper footwear prevents injury and enhances performance.' },
      beach: { item: 'Sandals/Flip Flops', color: 'Any', style: 'Casual', whyThis: 'Easy to wear and perfect for beach conditions.' },
      formal: { item: 'Formal Shoes', color: 'Black', style: 'Formal', whyThis: 'Essential for formal occasions.' },
      casual: { item: 'Loafers/Sneakers', color: 'Versatile', style: 'Smart Casual', whyThis: 'Comfortable yet stylish for everyday wear.' },
      trek: { item: 'Hiking Boots', color: 'Brown', style: 'Adventure', whyThis: 'Provides ankle support and grip on uneven terrain.' },
    };

    return footwearMap[situation] || { item: 'Casual Shoes', color: 'Versatile', style: 'Casual', whyThis: 'Versatile footwear for multiple occasions.' };
  }

  private suggestAccessories(context: SituationContext, situation: string): Accessory[] {
    const accessories: Accessory[] = [];
    const isMen = context.detectedGender === 'male' || !context.detectedGender;

    // Common accessories
    accessories.push({
      category: 'Timepiece',
      item: situation === 'formal' ? 'Formal Watch' : 'Casual Watch',
      color: situation === 'formal' ? 'Silver/Gold' : 'Any',
      material: 'Leather/Metal',
      style: situation === 'formal' ? 'Classic' : 'Versatile',
      brand: '',
      estimatedPrice: this.getPrice('watch'),
      essential: false,
      whyThis: 'A watch adds sophistication and shows attention to detail.',
    });

    // Belt
    accessories.push({
      category: 'Belt',
      item: isMen ? 'Leather Belt' : 'Belt/Sash',
      color: 'Matching outfit',
      material: 'Leather/Fabric',
      style: context.detectedDressCode,
      brand: '',
      estimatedPrice: this.getPrice('belt'),
      essential: context.detectedDressCode !== 'casual',
      whyThis: 'Essential for completing the look and maintaining outfit structure.',
    });

    // Bag
    if (situation !== 'gym' && situation !== 'sports') {
      accessories.push({
        category: 'Bag',
        item: this.getBagForSituation(situation),
        color: 'Versatile',
        material: 'Leather/Canvas',
        style: 'Functional',
        brand: '',
        estimatedPrice: this.getPrice('bag'),
        essential: false,
        whyThis: 'A quality bag adds both utility and style.',
      });
    }

    // Occasion-specific accessories
    if (situation.includes('wedding')) {
      accessories.push({
        category: 'Accessory',
        item: isMen ? 'Pocket Square' : 'Clutch/Handbag',
        color: 'Matching or accent',
        material: 'Silk/Fabric',
        style: 'Festive',
        brand: '',
        estimatedPrice: this.getPrice('accessory'),
        essential: false,
        whyThis: 'Adds a festive touch to the outfit.',
      });
    }

    if (situation === 'interview') {
      accessories.push({
        category: 'Accessory',
        item: 'Minimal/Basic',
        color: 'Subtle',
        material: 'Simple',
        style: 'Minimalist',
        brand: '',
        estimatedPrice: 0,
        essential: false,
        whyThis: 'Keep accessories minimal for interviews - let your skills shine.',
      });
    }

    return accessories;
  }

  private getBagForSituation(situation: string): string {
    const bagMap: Record<string, string> = {
      office: 'Briefcase/Laptop Bag',
      interview: 'Professional Portfolio Bag',
      travel: 'Weekender/Duffle Bag',
      college: 'Backpack/Messenger Bag',
      casual: 'Tote/Crossbody Bag',
      wedding: 'Clutch/Small Handbag',
    };
    return bagMap[situation] || 'Versatile Bag';
  }

  private suggestGrooming(context: SituationContext, situation: string): GroomingSuggestion[] {
    const suggestions: GroomingSuggestion[] = [];
    const isMen = context.detectedGender === 'male' || !context.detectedGender;

    // Basic grooming
    suggestions.push({
      category: 'Hygiene',
      suggestion: 'Complete grooming routine',
      product: 'Basic Grooming Kit',
      estimatedPrice: 500,
      whyThis: 'Good grooming is the foundation of any look.',
    });

    // Hairstyle
    if (situation === 'interview' || situation === 'formal') {
      suggestions.push({
        category: 'Hair',
        suggestion: isMen ? 'Clean, styled hair' : 'Neat, professional hairstyle',
        product: 'Hair Products/Accessories',
        estimatedPrice: 300,
        whyThis: 'Well-groomed hair creates a polished appearance.',
      });
    }

    // Fragrance
    if (situation !== 'gym' && situation !== 'sports') {
      suggestions.push({
        category: 'Fragrance',
        suggestion: 'Subtle, appropriate fragrance',
        product: 'Deodorant/Perfume',
        estimatedPrice: this.getPrice('fragrance'),
        whyThis: 'A pleasant scent leaves a lasting impression.',
      });
    }

    // Skincare
    if (context.detectedSeason === 'winter') {
      suggestions.push({
        category: 'Skincare',
        suggestion: 'Moisturize well',
        product: 'Moisturizer/Lip Balm',
        estimatedPrice: 300,
        whyThis: 'Winter weather can dry out skin - keep it hydrated.',
      });
    }

    return suggestions;
  }

  private createBudgetBreakdown(context: SituationContext, situation: string): BudgetItem[] {
    const baseRange = this.budgetRanges[situation] || this.budgetRanges.casual_party;
    let multiplier = 1;

    // Adjust for budget level
    if (context.detectedBudget === 'low') multiplier = 0.5;
    if (context.detectedBudget === 'high') multiplier = 2;

    // Adjust for duration
    if (context.detectedDuration === 'week') multiplier *= 1.5;
    if (context.detectedDuration === 'month') multiplier *= 3;

    const totalBudget = Math.round(baseRange.recommended * multiplier);

    return [
      {
        category: 'Top',
        item: 'Primary outfit piece',
        minPrice: Math.round(totalBudget * 0.25),
        maxPrice: Math.round(totalBudget * 0.4),
        recommendedPrice: Math.round(totalBudget * 0.3),
        priority: 1,
        notes: 'Focus on quality fabric and fit',
      },
      {
        category: 'Bottom',
        item: 'Bottom wear',
        minPrice: Math.round(totalBudget * 0.15),
        maxPrice: Math.round(totalBudget * 0.25),
        recommendedPrice: Math.round(totalBudget * 0.2),
        priority: 2,
        notes: 'Coordinate with top',
      },
      {
        category: 'Footwear',
        item: 'Shoes/Sandals',
        minPrice: Math.round(totalBudget * 0.15),
        maxPrice: Math.round(totalBudget * 0.25),
        recommendedPrice: Math.round(totalBudget * 0.2),
        priority: 3,
        notes: 'Invest in comfort',
      },
      {
        category: 'Accessories',
        item: 'Belt, Watch, Bag',
        minPrice: Math.round(totalBudget * 0.1),
        maxPrice: Math.round(totalBudget * 0.2),
        recommendedPrice: Math.round(totalBudget * 0.15),
        priority: 4,
        notes: 'Quality over quantity',
      },
      {
        category: 'Grooming',
        item: 'Personal care',
        minPrice: Math.round(totalBudget * 0.05),
        maxPrice: Math.round(totalBudget * 0.1),
        recommendedPrice: Math.round(totalBudget * 0.07),
        priority: 5,
        notes: 'Basic essentials',
      },
      {
        category: 'Contingency',
        item: 'Emergency fund',
        minPrice: Math.round(totalBudget * 0.05),
        maxPrice: Math.round(totalBudget * 0.1),
        recommendedPrice: Math.round(totalBudget * 0.08),
        priority: 6,
        notes: 'For unexpected needs',
      },
    ];
  }

  private generateAlternatives(context: SituationContext, situation: string, budget: BudgetItem[]): Alternative[] {
    const alternatives: Alternative[] = [];
    const totalBudget = budget.reduce((sum, b) => sum + b.recommendedPrice, 0);

    // Budget alternative
    alternatives.push({
      type: 'budget',
      outfit: this.generateBudgetOutfit(situation, totalBudget * 0.5),
      totalBudget: totalBudget * 0.5,
      savings: totalBudget * 0.5,
      bestFor: 'Budget-conscious shoppers who still want style',
    });

    // Premium alternative
    alternatives.push({
      type: 'premium',
      outfit: this.generatePremiumOutfit(situation, totalBudget * 2),
      totalBudget: totalBudget * 2,
      savings: 0,
      bestFor: 'Those seeking luxury and premium quality',
    });

    // Fusion alternative
    alternatives.push({
      type: 'fusion',
      outfit: this.generateFusionOutfit(situation, totalBudget),
      totalBudget: totalBudget,
      savings: 0,
      bestFor: 'Modern take combining traditional and contemporary',
    });

    return alternatives;
  }

  private generateBudgetOutfit(situation: string, budget: number): OutfitComponent[] {
    return [
      {
        category: 'Top',
        item: 'Cotton Kurta/Shirt',
        color: 'Solid color',
        fabric: 'Cotton',
        style: 'Simple',
        brand: 'Local brands',
        estimatedPrice: budget * 0.35,
        essential: true,
        priority: 'must_have',
        whyThis: 'Quality cotton at affordable price.',
      },
      {
        category: 'Bottom',
        item: 'Plain Churidar/Trousers',
        color: 'Matching',
        fabric: 'Cotton',
        style: 'Simple',
        brand: 'Local brands',
        estimatedPrice: budget * 0.25,
        essential: true,
        priority: 'must_have',
        whyThis: 'Comfortable and affordable.',
      },
      {
        category: 'Footwear',
        item: 'Synthetic Mojaris/Loafers',
        color: 'Versatile',
        fabric: 'Synthetic',
        style: 'Simple',
        brand: 'Local brands',
        estimatedPrice: budget * 0.25,
        essential: true,
        priority: 'must_have',
        whyThis: 'Good looks without high cost.',
      },
    ];
  }

  private generatePremiumOutfit(situation: string, budget: number): OutfitComponent[] {
    return [
      {
        category: 'Top',
        item: 'Embroidered Sherwani/Kurta',
        color: 'Premium colors',
        fabric: 'Silk/Luxury fabric',
        style: 'Premium',
        brand: 'Designer brands',
        estimatedPrice: budget * 0.45,
        essential: true,
        priority: 'must_have',
        whyThis: 'Premium fabric and craftsmanship for special occasions.',
      },
      {
        category: 'Bottom',
        item: 'Embroidered Bottom',
        color: 'Matching',
        fabric: 'Silk/Cotton Silk',
        style: 'Premium',
        brand: 'Designer brands',
        estimatedPrice: budget * 0.2,
        essential: true,
        priority: 'must_have',
        whyThis: 'Coordinates perfectly with the main outfit.',
      },
      {
        category: 'Footwear',
        item: 'Italian Leather Mojaris',
        color: 'Premium finish',
        fabric: 'Genuine Leather',
        style: 'Luxury',
        brand: 'Premium brands',
        estimatedPrice: budget * 0.2,
        essential: true,
        priority: 'must_have',
        whyThis: 'Genuine leather for comfort and style.',
      },
    ];
  }

  private generateFusionOutfit(situation: string, budget: number): OutfitComponent[] {
    return [
      {
        category: 'Top',
        item: 'Indo-Western Kurtas/Shirts',
        color: 'Modern colors',
        fabric: 'Cotton-Silk blend',
        style: 'Fusion',
        brand: 'Contemporary brands',
        estimatedPrice: budget * 0.35,
        essential: true,
        priority: 'must_have',
        whyThis: 'Modern interpretation of traditional wear.',
      },
      {
        category: 'Bottom',
        item: 'Styled Bottom Wear',
        color: 'Contrast or matching',
        fabric: 'Premium cotton',
        style: 'Fusion',
        brand: 'Contemporary brands',
        estimatedPrice: budget * 0.25,
        essential: true,
        priority: 'must_have',
        whyThis: 'Contemporary styling with traditional roots.',
      },
      {
        category: 'Footwear',
        item: 'Stylish Mojaris/Loafers',
        color: 'Versatile',
        fabric: 'Leather',
        style: 'Fusion',
        brand: 'Premium brands',
        estimatedPrice: budget * 0.25,
        essential: true,
        priority: 'must_have',
        whyThis: 'Perfect blend of traditional and modern.',
      },
    ];
  }

  private determineBuyingPriority(context: SituationContext, situation: string, components: OutfitComponent[]): BuyingPriority[] {
    const priorities: BuyingPriority[] = [];

    // Must-haves first
    const mustHaves = components.filter(c => c.priority === 'must_have');
    mustHaves.forEach((item, index) => {
      priorities.push({
        item: item.item,
        priority: index + 1,
        deadline: this.getDeadline(item.category, context),
        reason: `Essential for ${situation} - ${item.whyThis.substring(0, 50)}...`,
        quickLinks: [],
      });
    });

    // Recommended items next
    const recommended = components.filter(c => c.priority === 'recommended');
    recommended.forEach((item, index) => {
      priorities.push({
        item: item.item,
        priority: mustHaves.length + index + 1,
        deadline: this.getDeadline(item.category, context),
        reason: `Recommended - ${item.whyThis.substring(0, 50)}...`,
        quickLinks: [],
      });
    });

    return priorities;
  }

  private getDeadline(category: string, context: SituationContext): string {
    if (context.detectedUrgency === 'high') return 'Within 2-3 days';
    if (context.detectedUrgency === 'low') return 'Within 2-3 weeks';
    return 'Within 1 week';
  }

  private generateExpertAdvice(situation: string, context: SituationContext): ExpertAdvice[] {
    const experts: ExpertAdvice[] = [];

    // Add specific expert advice for the situation
    const perspectives = this.expertPerspectives[situation] || this.expertPerspectives.casual_party;
    perspectives.forEach(p => {
      experts.push({
        expert: p.expert,
        advice: p.advice,
        perspective: 'Expert recommendation',
      });
    });

    // Add universal advice
    experts.push({
      expert: '🛒 Shopping Advisor',
      advice: 'Buy main outfit first, then accessories to match.',
      perspective: 'Strategic shopping approach',
    });

    experts.push({
      expert: '📊 Value Analyst',
      advice: 'Check for ongoing sales before making big purchases.',
      perspective: 'Smart shopping tip',
    });

    return experts;
  }

  private buildExplanation(context: SituationContext, situation: string, components: OutfitComponent[]): string {
    return `Based on your ${situation} requirement, here is a complete shopping solution:

**Context Understood:**
- Occasion: ${context.detectedOccasion}
- Season: ${context.detectedSeason} (${context.detectedWeather} weather)
- Dress Code: ${context.detectedDressCode}
- Formality: ${context.detectedFormalityLevel}
- Budget Level: ${context.detectedBudget}
${context.detectedLocation ? `- Location: ${context.detectedLocation} (${context.detectedClimate} climate)` : ''}

**Recommended Outfit:**
${components.map(c => `- ${c.category}: ${c.item} (${c.color}) - ₹${c.estimatedPrice}`).join('\n')}

**Why This Works:**
${components.map(c => `• ${c.whyThis}`).join('\n')}

**Total Estimated Budget:** ₹${components.reduce((sum, c) => sum + c.estimatedPrice, 0)}

**Expert Tips:**
${this.generateExpertAdvice(situation, context).map(e => `• ${e.expert}: ${e.advice}`).join('\n')}`;
  }

  private documentReasoning(context: SituationContext, situation: string): ReasoningStep[] {
    const steps: ReasoningStep[] = [];

    steps.push({
      step: 1,
      thought: 'Analyzing the user query and situation',
      conclusion: `Detected situation: ${situation}`,
    });

    steps.push({
      step: 2,
      thought: 'Extracting context from query and user profile',
      conclusion: `Season: ${context.detectedSeason}, Weather: ${context.detectedWeather}, Budget: ${context.detectedBudget}`,
    });

    steps.push({
      step: 3,
      thought: 'Determining appropriate dress code and formality',
      conclusion: `Dress code: ${context.detectedDressCode}, Formality: ${context.detectedFormalityLevel}`,
    });

    steps.push({
      step: 4,
      thought: 'Selecting appropriate colors based on occasion and season',
      conclusion: `Recommended colors complement the ${situation} setting and ${context.detectedSeason} season`,
    });

    steps.push({
      step: 5,
      thought: 'Choosing fabrics suitable for weather and occasion',
      conclusion: `${this.seasonFabrics[context.detectedSeason]?.[0] || 'cotton'} recommended for ${context.detectedSeason}`,
    });

    steps.push({
      step: 6,
      thought: 'Allocating budget across categories',
      conclusion: 'Balanced allocation ensures quality main pieces while maintaining budget',
    });

    return steps;
  }

  private getPrice(category: string): number {
    const prices: Record<string, number> = {
      top: 1500,
      bottom: 1200,
      footwear: 2000,
      outerwear: 3000,
      watch: 2500,
      belt: 800,
      bag: 2000,
      accessory: 500,
      fragrance: 1500,
      premium: 15000,
    };
    return prices[category] || 1000;
  }
}

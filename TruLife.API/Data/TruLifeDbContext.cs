using Microsoft.EntityFrameworkCore;
using TruLife.API.Models;

namespace TruLife.API.Data
{
    public class TruLifeDbContext : DbContext
    {
        public TruLifeDbContext(DbContextOptions<TruLifeDbContext> options) : base(options)
        {
        }
        
        // User & Profile
        public DbSet<User> Users { get; set; }
        public DbSet<UserProfile> UserProfiles { get; set; }
        
        // Tracking
        public DbSet<ReadinessLog> ReadinessLogs { get; set; }
        public DbSet<WeightLog> WeightLogs { get; set; }
        public DbSet<HydrationLog> HydrationLogs { get; set; }
        public DbSet<AlcoholLog> AlcoholLogs { get; set; }
        public DbSet<NEATLog> NEATLogs { get; set; }
        public DbSet<Supplement> Supplements { get; set; }
        public DbSet<SupplementLog> SupplementLogs { get; set; }
        public DbSet<FastingSession> FastingSessions { get; set; }
        public DbSet<RecoveryLog> RecoveryLogs { get; set; }
        public DbSet<RecoveryToolLog> RecoveryToolLogs { get; set; }
        
        // Workout
        public DbSet<Models.Environment> Environments { get; set; }
        public DbSet<WorkoutProgram> WorkoutPrograms { get; set; }
        public DbSet<ProgramWeek> ProgramWeeks { get; set; }
        public DbSet<WorkoutSession> WorkoutSessions { get; set; }
        public DbSet<Exercise> Exercises { get; set; }
        public DbSet<WorkoutExercise> WorkoutExercises { get; set; }
        public DbSet<WorkoutFeedback> WorkoutFeedbacks { get; set; }
        public DbSet<EquipmentPreset> EquipmentPresets { get; set; }
        public DbSet<CoachingSession> CoachingSessions { get; set; }
        
        // Nutrition
        public DbSet<MacroTarget> MacroTargets { get; set; }
        public DbSet<MealLog> MealLogs { get; set; }
        public DbSet<MealPhoto> MealPhotos { get; set; }
        public DbSet<RestaurantRecommendation> RestaurantRecommendations { get; set; }
        
        // Analysis
        public DbSet<LabResult> LabResults { get; set; }
        public DbSet<Biomarker> Biomarkers { get; set; }
        public DbSet<DNAAnalysis> DNAAnalyses { get; set; }
        public DbSet<SNPInterpretation> SNPInterpretations { get; set; }
        public DbSet<GeneticProfile> GeneticProfiles { get; set; }
        
        // Progress & Settings
        public DbSet<ProgressPhoto> ProgressPhotos { get; set; }
        public DbSet<UserSettings> UserSettings { get; set; }
        
        // Couples
        public DbSet<CoupleProfile> CoupleProfiles { get; set; }
        public DbSet<CoupleChallenge> CoupleChallenges { get; set; }
        public DbSet<CoupleGoal> CoupleGoals { get; set; }
        public DbSet<RomanticAttractionPoll> RomanticAttractionPolls { get; set; }
        public DbSet<RomanticEvening> RomanticEvenings { get; set; }
        public DbSet<CoupleMessage> CoupleMessages { get; set; }
        public DbSet<CoupleAttraction> CoupleAttractions { get; set; }
        public DbSet<MoodAdjustment> MoodAdjustments { get; set; }
        public DbSet<FlirtMessage> FlirtMessages { get; set; }
        public DbSet<UpgradeProposal> UpgradeProposals { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // User - UserProfile (1:1) - CRITICAL FOR PROFILE DATA PERSISTENCE
            modelBuilder.Entity<User>()
                .HasOne(u => u.Profile)
                .WithOne(p => p.User)
                .HasForeignKey<UserProfile>(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            
            // User - RecoveryLogs (1:Many)
            modelBuilder.Entity<RecoveryLog>()
                .HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            
            // User - ProgressPhotos (1:Many)
            modelBuilder.Entity<ProgressPhoto>()
                .HasOne(p => p.User)
                .WithMany()
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            
            // User - UserSettings (1:1)
            modelBuilder.Entity<UserSettings>()
                .HasOne(s => s.User)
                .WithOne()
                .HasForeignKey<UserSettings>(s => s.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            
            // User - EquipmentPresets (1:Many)
            modelBuilder.Entity<EquipmentPreset>()
                .HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            
            // User - WorkoutPrograms (1:Many)
            modelBuilder.Entity<WorkoutProgram>()
                .HasOne(wp => wp.User)
                .WithMany()
                .HasForeignKey(wp => wp.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            
            // WorkoutProgram - ProgramWeeks (1:Many)
            modelBuilder.Entity<ProgramWeek>()
                .HasOne(pw => pw.WorkoutProgram)
                .WithMany(wp => wp.Weeks)
                .HasForeignKey(pw => pw.WorkoutProgramId)
                .OnDelete(DeleteBehavior.Cascade);
            
            // WorkoutSession - WorkoutFeedback (1:1)
            modelBuilder.Entity<WorkoutFeedback>()
                .HasOne(wf => wf.WorkoutSession)
                .WithOne()
                .HasForeignKey<WorkoutFeedback>(wf => wf.WorkoutSessionId)
                .OnDelete(DeleteBehavior.Cascade);
            
            // User - CoachingSessions (1:Many)
            modelBuilder.Entity<CoachingSession>()
                .HasOne(cs => cs.User)
                .WithMany()
                .HasForeignKey(cs => cs.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            
            // CoupleProfile - CoupleAttraction (1:1)
            modelBuilder.Entity<CoupleAttraction>()
                .HasOne(ca => ca.CoupleProfile)
                .WithOne()
                .HasForeignKey<CoupleAttraction>(ca => ca.CoupleProfileId)
                .OnDelete(DeleteBehavior.Cascade);
            
            // RomanticEvening - MoodAdjustments (1:Many)
            modelBuilder.Entity<MoodAdjustment>()
                .HasOne(ma => ma.RomanticEvening)
                .WithMany()
                .HasForeignKey(ma => ma.RomanticEveningId)
                .OnDelete(DeleteBehavior.Cascade);
            
            // CoupleProfile - UpgradeProposals (1:Many)
            modelBuilder.Entity<UpgradeProposal>()
                .HasOne(up => up.CoupleProfile)
                .WithMany()
                .HasForeignKey(up => up.CoupleProfileId)
                .OnDelete(DeleteBehavior.Cascade);
            
            // CoupleProfile relationships
            modelBuilder.Entity<CoupleProfile>()
                .HasOne<User>()
                .WithMany()
                .HasForeignKey(cp => cp.PartnerAId)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<CoupleProfile>()
                .HasOne<User>()
                .WithMany()
                .HasForeignKey(cp => cp.PartnerBId)
                .OnDelete(DeleteBehavior.Restrict);
            
            // Indexes for performance
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();
            
            modelBuilder.Entity<ReadinessLog>()
                .HasIndex(r => new { r.UserId, r.LogDate });
            
            modelBuilder.Entity<WorkoutSession>()
                .HasIndex(w => new { w.UserId, w.ScheduledDate });
            
            modelBuilder.Entity<MealLog>()
                .HasIndex(m => new { m.UserId, m.LogDate });
            
            
            modelBuilder.Entity<CoupleProfile>()
                .HasIndex(cp => new { cp.PartnerAId, cp.PartnerBId })
                .IsUnique();
            
            
            // DNAAnalysis - SNPInterpretation relationship
            modelBuilder.Entity<DNAAnalysis>()
                .HasMany(d => d.SNPs)
                .WithOne(s => s.DNAAnalysis)
                .HasForeignKey(s => s.DNAAnalysisId)
                .OnDelete(DeleteBehavior.Cascade);
            
            // Ignore the SNPInterpretations property (it's just an alias)
            modelBuilder.Entity<DNAAnalysis>()
                .Ignore(d => d.SNPInterpretations);
        }
    }
}

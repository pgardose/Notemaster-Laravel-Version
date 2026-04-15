<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Note;
use App\Models\Tag;
use App\Models\User;
use App\Models\Message;

class NoteSeeder extends Seeder
{
    /**
     * Creates 10 realistic study notes, each:
     *  - Assigned to a random user from the users table
     *  - Given a subject-appropriate original_content and AI-style summary
     *  - Attached to 1–2 relevant tags (many-to-many via note_tag)
     *  - Seeded with 2 sample AI chat messages (role: user / assistant)
     */
    public function run(): void
    {
        // Collect all seeded user IDs and tag names for assignment
        $userIds = User::pluck('id')->toArray();
        $tags    = Tag::all()->keyBy('name');

        // ── Note definitions ──────────────────────────────────────────────
        $notes = [
            [
                'title'            => 'Photosynthesis Summary',
                'original_content' => "Photosynthesis is the process by which green plants, algae, and some bacteria convert light energy (usually from the sun) into chemical energy stored as glucose. It occurs primarily in the chloroplasts, using chlorophyll to absorb sunlight. The overall equation is: 6CO2 + 6H2O + light energy → C6H12O6 + 6O2. There are two main stages: the light-dependent reactions (which produce ATP and NADPH) and the Calvin cycle (which uses these to fix CO2 into glucose). Factors that affect the rate include light intensity, CO2 concentration, and temperature.",
                'summary'          => "• Photosynthesis converts light energy into glucose stored as chemical energy.\n• Occurs in chloroplasts using the pigment chlorophyll.\n• Equation: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂\n• Two stages: Light-dependent reactions (produce ATP/NADPH) and the Calvin Cycle (fixes CO₂).\n• Rate is affected by light intensity, CO₂ levels, and temperature.",
                'tags'             => ['Science'],
                'chat'             => [
                    ['role' => 'user',      'content' => 'What is the main purpose of the Calvin Cycle?'],
                    ['role' => 'assistant', 'content' => 'The Calvin Cycle uses the ATP and NADPH produced in the light-dependent reactions to convert carbon dioxide (CO₂) from the atmosphere into glucose through a process called carbon fixation. It does not directly require light, which is why it is sometimes called the "light-independent" stage.'],
                ],
            ],
            [
                'title'            => 'World War II Timeline',
                'original_content' => "World War II lasted from 1939 to 1945 and involved most of the world's nations. Key events: 1939 — Germany invades Poland; Britain and France declare war. 1940 — Fall of France, Battle of Britain. 1941 — Germany invades USSR (Operation Barbarossa); Japan attacks Pearl Harbor; USA enters the war. 1942 — Battle of Midway; Battle of Stalingrad begins. 1943 — Allied invasion of Italy; Stalingrad falls to the Soviets. 1944 — D-Day (June 6, Normandy landings); Liberation of Paris. 1945 — Germany surrenders (May 8, V-E Day); Atomic bombs dropped on Hiroshima (Aug 6) and Nagasaki (Aug 9); Japan surrenders (Aug 15, V-J Day).",
                'summary'          => "• WWII (1939–1945) involved most of the world's nations in two main alliances: the Allies and the Axis.\n• 1939: Germany invades Poland → Britain and France declare war.\n• 1941: Two pivotal events — Germany invades USSR & Japan attacks Pearl Harbor, bringing the USA into the war.\n• 1944: D-Day (June 6) — the largest seaborne invasion in history.\n• 1945: Germany surrenders (V-E Day, May 8); atomic bombs end the Pacific War (V-J Day, Aug 15).",
                'tags'             => ['History', 'Urgent'],
                'chat'             => [
                    ['role' => 'user',      'content' => 'Why was the Battle of Stalingrad a turning point?'],
                    ['role' => 'assistant', 'content' => 'The Battle of Stalingrad (1942–1943) was a turning point because it was the first major German defeat on the Eastern Front. The Soviet encirclement and capture of the German 6th Army shattered the myth of Nazi invincibility, destroyed an entire German army group, and forced Germany onto the defensive for the rest of the war in the East.'],
                ],
            ],
            [
                'title'            => 'The Cell Cycle and Mitosis',
                'original_content' => "The cell cycle is the ordered series of events by which a cell duplicates its contents and divides. It has two major phases: Interphase (G1, S, G2) and the Mitotic phase (M). During Interphase, the cell grows (G1), replicates its DNA (S phase), and prepares for division (G2). Mitosis itself has four stages: Prophase (chromosomes condense, spindle forms), Metaphase (chromosomes align at the cell's equator), Anaphase (sister chromatids pulled apart to opposite poles), and Telophase (nuclear envelopes reform). Cytokinesis then splits the cell into two identical daughter cells. Cell cycle checkpoints (G1, G2, and Spindle) ensure accuracy.",
                'summary'          => "• The cell cycle = Interphase (G1 → S → G2) + Mitosis (M phase).\n• Interphase: cell grows, DNA replicates, and prepares to divide.\n• Mitosis stages: Prophase → Metaphase → Anaphase → Telophase (PMAT).\n• Cytokinesis splits the cell into two genetically identical daughter cells.\n• Checkpoints (G1, G2, Spindle) prevent errors from being passed on.",
                'tags'             => ['Science'],
                'chat'             => [
                    ['role' => 'user',      'content' => 'What is the easiest way to remember the stages of mitosis?'],
                    ['role' => 'assistant', 'content' => 'A popular mnemonic is PMAT: Prophase, Metaphase, Anaphase, Telophase. You can also use the sentence "People Meet And Talk" to remember the order. Each letter corresponds to the first letter of each mitosis stage.'],
                ],
            ],
            [
                'title'            => 'Introduction to Quadratic Equations',
                'original_content' => "A quadratic equation is a second-order polynomial equation in a single variable x with the standard form ax² + bx + c = 0, where a ≠ 0. The solutions (roots) can be found by: (1) Factoring, (2) Completing the square, or (3) The Quadratic Formula: x = [-b ± √(b²-4ac)] / 2a. The discriminant (b²-4ac) determines the nature of roots: if > 0, two distinct real roots; if = 0, one repeated real root; if < 0, two complex roots. Quadratics graph as parabolas — opening upward if a > 0, downward if a < 0. The vertex is at x = -b/2a.",
                'summary'          => "• Quadratic equation standard form: ax² + bx + c = 0 (a ≠ 0).\n• Three solving methods: Factoring, Completing the Square, Quadratic Formula.\n• Quadratic Formula: x = [−b ± √(b²−4ac)] / 2a\n• Discriminant (b²−4ac): >0 = two real roots, =0 = one root, <0 = no real roots.\n• Graph is a parabola; vertex at x = −b/2a.",
                'tags'             => ['Math'],
                'chat'             => [
                    ['role' => 'user',      'content' => 'When should I use the quadratic formula vs factoring?'],
                    ['role' => 'assistant', 'content' => 'Factoring is fastest when the equation factors neatly (e.g., x² + 5x + 6 = (x+2)(x+3)). Use the quadratic formula when the equation does not factor easily, when coefficients are large, or when you need exact decimal answers. The formula always works for any quadratic, so when in doubt, use it.'],
                ],
            ],
            [
                'title'            => 'Shakespearean Tragedy: Hamlet Analysis',
                'original_content' => "Hamlet, written by William Shakespeare around 1600, is considered one of the greatest works in English literature. The play follows Prince Hamlet of Denmark after his father, King Hamlet, is murdered by his uncle Claudius, who then marries Hamlet's mother Gertrude and takes the throne. Key themes include: revenge and justice, mortality (\"To be or not to be\"), deception and appearance vs. reality, corruption and moral decay, and madness (both feigned and real). Major characters: Hamlet (protagonist), Claudius (antagonist), Gertrude, Ophelia, Horatio, Polonius, and the Ghost. The play ends in a tragic bloodbath with nearly every major character dead.",
                'summary'          => "• Hamlet (c.1600) is Shakespeare's longest play and a cornerstone of Western literature.\n• Plot: Prince Hamlet seeks revenge for his father's murder by his uncle Claudius.\n• Central themes: revenge, mortality, deception, corruption, and madness.\n• Famous soliloquy: \"To be or not to be\" — Hamlet contemplates existence and suicide.\n• Ends in a tragedy — Claudius, Gertrude, Laertes, and Hamlet all die in the final act.",
                'tags'             => ['Literature'],
                'chat'             => [
                    ['role' => 'user',      'content' => 'What does "To be or not to be" actually mean?'],
                    ['role' => 'assistant', 'content' => '"To be or not to be" is Hamlet contemplating whether it is nobler to endure life\'s hardships (to be) or to end them through death (not to be). He is essentially wrestling with the question of suicide versus perseverance. The soliloquy reflects his paralysis and the central conflict of the play: action versus inaction.'],
                ],
            ],
            [
                'title'            => 'Newton\'s Laws of Motion',
                'original_content' => "Sir Isaac Newton formulated three fundamental laws of motion in his 1687 work Principia Mathematica. First Law (Law of Inertia): An object at rest stays at rest, and an object in motion stays in motion at a constant velocity unless acted upon by a net external force. Second Law: The acceleration of an object is directly proportional to the net force and inversely proportional to its mass. Formula: F = ma. Third Law: For every action, there is an equal and opposite reaction. Applications include: calculating rocket thrust, understanding car seatbelts (inertia), and designing bridges.",
                'summary'          => "• Newton's 1st Law (Inertia): Objects resist changes in their state of motion without a net force.\n• Newton's 2nd Law: F = ma — Force equals mass times acceleration.\n• Newton's 3rd Law: Every action has an equal and opposite reaction.\n• Published in Principia Mathematica (1687) — foundation of classical mechanics.\n• Real-world applications: rockets, car safety, structural engineering.",
                'tags'             => ['Science', 'Math'],
                'chat'             => [
                    ['role' => 'user',      'content' => 'Can you give a simple example of Newton\'s Third Law?'],
                    ['role' => 'assistant', 'content' => 'Sure! When you push off a wall, you feel the wall pushing back against you with equal force — that is Newton\'s Third Law. Another example: a rocket expels gas downward (action), and the rocket is pushed upward (reaction). Or when you jump off a boat, the boat moves slightly in the opposite direction.'],
                ],
            ],
            [
                'title'            => 'The French Revolution — Causes & Effects',
                'original_content' => "The French Revolution (1789–1799) was a period of radical political and societal change in France. Main causes: the financial crisis of the French state (debt from wars including support for the American Revolution), the rigid social structure of the Estates (Third Estate = 97% of population but paid most taxes), Enlightenment ideas of liberty and equality, food shortages and bread prices, and weak leadership of King Louis XVI. Key events: Storming of the Bastille (July 14, 1789), Declaration of the Rights of Man, Reign of Terror (1793–1794) under Robespierre, and eventually Napoleon's rise. Effects: abolished feudalism, spread Enlightenment ideals across Europe, influenced future democratic revolutions worldwide.",
                'summary'          => "• The French Revolution (1789–1799) ended the French monarchy and transformed society.\n• Causes: debt, unjust taxation of the Third Estate, Enlightenment ideals, food shortages, weak king.\n• Key event: Storming of the Bastille (July 14, 1789) — now France's national holiday.\n• Reign of Terror (1793–94): Robespierre's radical phase — thousands guillotined.\n• Legacy: abolished feudalism in France; inspired democratic movements across the world.",
                'tags'             => ['History'],
                'chat'             => [
                    ['role' => 'user',      'content' => 'What role did the Enlightenment play in the French Revolution?'],
                    ['role' => 'assistant', 'content' => 'Enlightenment thinkers like Voltaire, Rousseau, and Montesquieu challenged the authority of kings and the Church, promoting ideas of reason, individual rights, and democracy. These ideas gave the revolutionaries an intellectual framework to criticize the monarchy and justify replacing it with a government based on liberty, equality, and fraternity (Liberté, Égalité, Fraternité).'],
                ],
            ],
            [
                'title'            => 'DNA Structure and Replication',
                'original_content' => "DNA (Deoxyribonucleic Acid) is the molecule that carries genetic information in all living organisms. Structure: a double helix composed of two complementary strands of nucleotides. Each nucleotide contains a sugar (deoxyribose), a phosphate group, and one of four nitrogenous bases: Adenine (A), Thymine (T), Guanine (G), and Cytosine (C). Base pairing rules: A pairs with T (2 hydrogen bonds), G pairs with C (3 hydrogen bonds). Replication is semi-conservative — each strand serves as a template. Key enzymes: Helicase (unwinds the helix), DNA Polymerase (synthesizes new strands, 5'→3' direction), Ligase (joins Okazaki fragments on the lagging strand).",
                'summary'          => "• DNA = double helix made of nucleotide chains (sugar + phosphate + base).\n• Four bases: Adenine (A), Thymine (T), Guanine (G), Cytosine (C).\n• Base-pairing rules: A–T (2 bonds), G–C (3 bonds).\n• Replication is semi-conservative: each new DNA molecule has one old and one new strand.\n• Key enzymes: Helicase (unwinds), DNA Polymerase (builds), Ligase (seals gaps).",
                'tags'             => ['Science'],
                'chat'             => [
                    ['role' => 'user',      'content' => 'What does semi-conservative replication mean?'],
                    ['role' => 'assistant', 'content' => 'Semi-conservative replication means that when DNA is copied, each of the two resulting double-stranded DNA molecules contains one original (conserved) strand and one newly synthesized strand. So the original molecule is "conserved" — it is split and each half serves as a template. This was confirmed by the Meselson–Stahl experiment in 1958.'],
                ],
            ],
            [
                'title'            => 'Supply and Demand Economics',
                'original_content' => "Supply and demand is the foundational model of market economics. The Law of Demand states that as price increases, quantity demanded decreases (inverse relationship), shown as a downward-sloping demand curve. The Law of Supply states that as price increases, quantity supplied increases (direct relationship), shown as an upward-sloping supply curve. Market equilibrium is reached where the two curves intersect — the price at which quantity supplied equals quantity demanded. Shifts in curves occur due to changes in income, tastes, input costs, technology, or number of buyers/sellers. Price elasticity measures how sensitive demand or supply is to a price change.",
                'summary'          => "• Law of Demand: Price ↑ → Quantity demanded ↓ (inverse relationship).\n• Law of Supply: Price ↑ → Quantity supplied ↑ (direct relationship).\n• Equilibrium = where supply and demand curves intersect (market-clearing price).\n• Curve shifts are caused by: income changes, consumer preferences, input costs, technology.\n• Price elasticity measures responsiveness of demand/supply to price changes.",
                'tags'             => ['Math'],
                'chat'             => [
                    ['role' => 'user',      'content' => 'What happens to equilibrium price when demand increases?'],
                    ['role' => 'assistant', 'content' => 'When demand increases (the demand curve shifts right), there is a shortage at the original price. Sellers respond by raising prices. The new equilibrium settles at a higher price and higher quantity. In short: Demand ↑ → Equilibrium Price ↑ and Equilibrium Quantity ↑.'],
                ],
            ],
            [
                'title'            => 'Python Programming Fundamentals',
                'original_content' => "Python is a high-level, interpreted, general-purpose programming language known for its readability and simplicity. Key fundamentals: Variables & Data Types (int, float, str, bool, list, dict, tuple, set). Control Flow: if/elif/else statements and loops (for, while). Functions: defined with def keyword, support default arguments and return values. Object-Oriented Programming: classes defined with class, using __init__ for constructors, and supporting inheritance. Exception Handling: try/except/finally blocks. Common built-in functions: print(), len(), range(), type(), input(). Libraries: NumPy (math), Pandas (data), Matplotlib (charts), Flask/Django (web).",
                'summary'          => "• Python is a readable, beginner-friendly, interpreted programming language.\n• Core data types: int, float, str, bool, list, dict, tuple, set.\n• Control flow: if/elif/else and for/while loops.\n• Functions use the def keyword; classes use class and __init__.\n• Exception handling: try → except → finally.\n• Key libraries: NumPy (math), Pandas (data analysis), Flask/Django (web development).",
                'tags'             => ['Math', 'Science'],
                'chat'             => [
                    ['role' => 'user',      'content' => 'What is the difference between a list and a tuple in Python?'],
                    ['role' => 'assistant', 'content' => 'The main difference is mutability. A list is mutable — you can add, remove, or change elements after creation (e.g., my_list[0] = 10). A tuple is immutable — once created, its contents cannot be changed. Use lists when you need a collection that might change, and tuples for fixed data like coordinates or database records.'],
                ],
            ],
        ];

        // ── Create each note with tags and chat history ───────────────────
        foreach ($notes as $noteData) {
            // Pick a random user ID for this note
            $userId = $userIds[array_rand($userIds)];

            $note = Note::create([
                'user_id'          => $userId,
                'title'            => $noteData['title'],
                'original_content' => $noteData['original_content'],
                'summary'          => $noteData['summary'],
            ]);

            // Attach relevant tags (skip any that weren't seeded)
            $tagIds = collect($noteData['tags'])
                ->map(fn($name) => $tags->get($name)?->id)
                ->filter()
                ->values()
                ->toArray();

            if (!empty($tagIds)) {
                $note->tags()->sync($tagIds);
            }

            // Seed 2 realistic chat messages per note
            foreach ($noteData['chat'] as $message) {
                Message::create([
                    'note_id' => $note->id,
                    'role'    => $message['role'],
                    'content' => $message['content'],
                ]);
            }
        }
    }
}
const fs = require('fs');

let lines = fs.readFileSync('src/App.tsx', 'utf8').split('\n');
const startLine = 305;
const endLine = 353; // inclusive 0-indexed is line 354 length

const replacement = `          <label className="block text-left text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 ml-2">
            Location/City
          </label>
          <input 
            type="text" 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Koramangala, Bangalore" 
            className="w-full skeuo-input mb-6 placeholder:text-zinc-400 text-zinc-800"
          />

          <label className="block text-left text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 ml-2">
            Squad Size
          </label>
          <input 
            type="number" 
            min="2"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            placeholder="Total number of people (including you)..." 
            className="w-full skeuo-input mb-6 placeholder:text-zinc-400 text-zinc-800"
            onKeyDown={(e) => {
              if (e.key === '-' || e.key === '.' || e.key === 'e') e.preventDefault();
            }}
          />

          {error && <p className="text-rose-600 font-bold text-sm mb-4 text-left">{error}</p>}

          <button 
            onClick={handleCreate}
            disabled={isLoading || !brief || !location || !size || !hostName}
            className="w-full skeuo-button-primary py-4 text-base flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{isLoading ? 'CREATING...' : 'GET STARTED'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </SkeuoCard>
      </motion.div>`;

const newLines = [...lines.slice(0, startLine), replacement, ...lines.slice(endLine + 1)];
fs.writeFileSync('src/App.tsx', newLines.join('\n'));
console.log("Fixed App.tsx");

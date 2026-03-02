import React from 'react';

export const GameBackground: React.FC = () => {
    return (
        <div className="game-bg" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
            {/* Sky */}
            <div style={{ width: '100%', height: '70%', background: 'linear-gradient(180deg, #5BC0EB 0%, #3a76a8 100%)' }}></div>

            {/* Grass/Hiding Area */}
            <div style={{ width: '100%', height: '30%', backgroundColor: '#9BC53D', borderTop: '8px solid #33691E', position: 'relative' }}>
                {/* Pixel Bushes */}
                <div style={{ position: 'absolute', top: '-40px', left: '20%', width: '100px', height: '60px', backgroundColor: '#4C956C', borderRadius: '15px 15px 0 0', boxShadow: '10px 0 #2C6E49' }}></div>
                <div style={{ position: 'absolute', top: '-50px', left: '60%', width: '150px', height: '80px', backgroundColor: '#4C956C', borderRadius: '30px 30px 0 0', boxShadow: '15px 0 #2C6E49' }}></div>
                <div style={{ position: 'absolute', top: '-30px', left: '85%', width: '80px', height: '40px', backgroundColor: '#4C956C', borderRadius: '10px 10px 0 0', boxShadow: '8px 0 #2C6E49' }}></div>
            </div>

            {/* The Iconic Tree */}
            <div className="retro-tree" style={{ position: 'absolute', bottom: '25%', left: '5%', width: '120px', height: '300px', zIndex: 2 }}>
                {/* Trunk */}
                <div style={{ position: 'absolute', bottom: 0, left: '40px', width: '40px', height: '100%', backgroundColor: '#332111', borderRight: '8px solid #231100' }}></div>
                {/* Leaves */}
                <div style={{ position: 'absolute', top: '0', left: '-20px', width: '160px', height: '140px', backgroundColor: '#4C956C', borderRadius: '40%', boxShadow: '10px 10px 0 #2C6E49' }}></div>
                <div style={{ position: 'absolute', top: '40px', left: '-50px', width: '100px', height: '80px', backgroundColor: '#4C956C', borderRadius: '50%', boxShadow: '8px 8px 0 #2C6E49' }}></div>
                <div style={{ position: 'absolute', top: '50px', right: '-40px', width: '90px', height: '70px', backgroundColor: '#4C956C', borderRadius: '50%', boxShadow: '8px 8px 0 #2C6E49' }}></div>
            </div>
        </div>
    );
};

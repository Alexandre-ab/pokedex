using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WinFormsApp4;

namespace WinFormsApp4;

public class Attaque
{

    // Propriétés de l'attaque
    public string Nom { get; private set; }
    public int Degats { get; private set; }
    public string TypeAttaque { get; private set; } // Par exemple: "Physique", "Magique", etc.
    public float Precision { get; private set; } // Probabilité de toucher (entre 0 et 1)
    public string Effet { get; private set; } // Effet spécial (facultatif)



    public Attaque(string nom, int degats, string typeAttaque, float precision, string effet = null)
    {
        Nom = nom;
        Degats = degats;
        TypeAttaque = typeAttaque;
        Precision = precision;
        Effet = effet;
    }

    public bool LancerAttaque()
    {
        // Génère un nombre aléatoire pour déterminer si l'attaque touche
        Random rand = new Random();
        float chance = (float)rand.NextDouble();

        if (chance <= Precision)
        {
            Console.WriteLine($"{Nom} a réussi et inflige {Degats} dégâts !");
            if (!string.IsNullOrEmpty(Effet))
            {                                                                                          // si il ne réussi pas alors attaque échoué. KLdn
                Console.WriteLine($"Effet appliqué : {Effet}");
            }
            return true;
        }
        else
        {
            Console.WriteLine($"{Nom} a échoué.");
            return false;
        }
    }
}



namespace WinFormsApp4
{
    partial class Form3
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(Form3));
            label1 = new Label();
            listBox1 = new ListBox();
            progressBar1 = new ProgressBar();
            lblTexte = new Button();
            SuspendLayout();
            // 
            // label1
            // 
            label1.AutoSize = true;
            label1.BackColor = Color.Transparent;
            label1.Font = new Font("Segoe UI", 23.25F, FontStyle.Regular, GraphicsUnit.Point, 0);
            label1.ForeColor = SystemColors.ButtonHighlight;
            label1.Location = new Point(520, 250);
            label1.Name = "label1";
            label1.Size = new Size(224, 42);
            label1.TabIndex = 0;
            label1.Text = "Mes Pokémons";
            // 
            // listBox1
            // 
            listBox1.FormattingEnabled = true;
            listBox1.ItemHeight = 15;
            listBox1.Items.AddRange(new object[] { "NORMALEMENT LES POKEMONS ", "", "", "        ", "  S'AFFCIHE ICI" });
            listBox1.Location = new Point(102, 208);
            listBox1.Name = "listBox1";
            listBox1.Size = new Size(259, 169);
            listBox1.TabIndex = 1;
            listBox1.SelectedIndexChanged += listBox1_SelectedIndexChanged_1;
            // 
            // progressBar1
            // 
            progressBar1.Location = new Point(500, 512);
            progressBar1.Name = "progressBar1";
            progressBar1.Size = new Size(263, 52);
            progressBar1.TabIndex = 2;
            progressBar1.Value = 55;
            // 
            // lblTexte
            // 
            lblTexte.BackColor = Color.Transparent;
            lblTexte.Location = new Point(146, 525);
            lblTexte.Name = "lblTexte";
            lblTexte.Size = new Size(82, 28);
            lblTexte.TabIndex = 3;
            lblTexte.Text = "Ajouter ";
            lblTexte.UseVisualStyleBackColor = false;
            lblTexte.Click += button1_Click;
            // 
            // Form3
            // 
            AutoScaleDimensions = new SizeF(7F, 15F);
            AutoScaleMode = AutoScaleMode.Font;
            BackColor = SystemColors.ControlDarkDark;
            BackgroundImage = (Image)resources.GetObject("$this.BackgroundImage");
            ClientSize = new Size(821, 615);
            Controls.Add(lblTexte);
            Controls.Add(progressBar1);
            Controls.Add(listBox1);
            Controls.Add(label1);
            Name = "Form3";
            Text = "^pàià";
            Load += Form3_Load;
            ResumeLayout(false);
            PerformLayout();
        }

        #endregion

        private Label label1;
        private ListBox listBox1;
        private ProgressBar progressBar1;
        private Button lblTexte;
    }
}
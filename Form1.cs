namespace WinFormsApp4
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }

        private void button1_Click(object sender, EventArgs e)
        {
            Form2 sw = new Form2();
            sw.ShowDialog();

        }

        private void button2_Click(object sender, EventArgs e)
        {
            Form3 sw = new Form3();
            sw.ShowDialog();

        }

        private void Form1_Load(object sender, EventArgs e)
        {

        }
    }
}

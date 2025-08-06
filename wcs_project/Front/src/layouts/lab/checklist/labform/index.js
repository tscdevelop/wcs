import React from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import {
  Box,
  Grid,
  Checkbox,
  FormControlLabel,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const sections = [
  {
    title: 'Hematology',
    items: ['CBC', 'Platelet count', 'PCV/TP', 'Reticulocyte Count'],
  },
  {
    title: 'Parasitology',
    items: [
      'Blood Parasites (smear)',
      'Modified Knott’s Test',
      'Fecal Exam',
      'Skin Scraping',
      'Scotch tape cytology',
      'Deep skin scraping',
      'Ear cytology',
    ],
  },
  {
    title: 'Coagulation',
    items: ['Fibrinogen', 'PT', 'TT', 'FDPs', 'PT/aPTT', 'aPTT', 'ACT'],
  },
  {
    title: 'Coagulation',
    items: [
      'Blood Parasite (test kit)',
      '4DX',
      'Triple Test (FIV,FeLV,HW)',
      'FIV/FeLV',
      'Heartworm',
      'Pro BNP',
      'CPL',
      'FPL',
      'Giardia',
      'Brucellosis',
      'CPV Ab',
      'CCV',
      'CDV Ab',
      'FPV Ab',
      'FHV',
    ],
  },
  {
    title: 'Other Tests',
    items: [
      'Crossmatching',
      'Fluid analysis',
      'D-Dimer',
      'IMHA',
      'Rabies',
      'Rabies titer',
      'Canine blood typing',
      'Feline blood typing',
      'Cryptococcosis',
    ],
  },
  {
    title: 'Image',
    items: [
      'X-ray 1 ท่า',
      'X-ray 2 ท่า',
      'X-ray 3 ท่า',
      'U/S lower /upper Abdomen',
      'U/S whole Abdomen',
      'Echocardiogram',
    ],
  },
  {
    title: 'Allergy test',
    items: ['Allergy test (IDT)', 'IgE', 'Coomb’s Test'],
  },
  {
    title: 'Microbiology',
    items: [
      'Bacterial culture and sensitivity',
      'Wood lamp',
      'Fungal culture',
      'KOH',
    ],
  },
  {
    title: 'Blood Chemistry',
    items: [
      'ALT(SGPT)',
      'SAA',
      'Creatinine',
      'ALK',
      'Fructosamine',
      'T. Bilirubin',
      'Cholesterol',
      'Globulin',
      'LDH',
      'D. Bilirubin',
      'Total Protein',
      'Triglyceride',
      'Lipase',
      'CPK',
      'Ammonia',
      'Glucose',
      'AST(SGOT)',
      'Lactate',
      'Uric Acid',
      'Amylase',
      'GGT',
      'Theophylline',
      'CK',
      'Albumin',
      'Phenobarbital',
      'CRP',
      'BUN',
      'SDMA',
    ],
  },
  {
    title: 'Electrolytes',
    items: [
      'Blood gas (Arterial)',
      'Blood gas (Venous)',
      'CO2',
      'Na K Cl',
      'Na',
      'P',
      'K',
      'Cl',
      'Ca',
      'Mg',
    ],
  },
  {
    title: 'Urinalysis',
    items: ['Urinalysis (UA)', 'Urine sediment', 'UPC'],
  },
  {
    title: 'Hormone',
    items: [
      'T3',
      'Estradiol',
      'T4',
      'Progesterone',
      'TSH',
      'Free T4',
      'ACTH',
      'HDDS',
      'Cortisol',
      'cT4',
      'LDDS',
      'Testosterone',
    ],
  },
  {
    title: 'Cortisol',
    items: ['Baseline', 'ACTH Stim', 'LDDS', 'HDDS'],
  },
  {
    title: 'Set',
    items: [
      'Set 1. CBC, PLT, ALT, BP Creatinine',
      'Set 2. CBC, PLT, ALT, AST, Creatinine, ALP, BUN',
      'Set 3. CBC, PLT, ALT, Creatinine',
      'Set 4.',
      'Set 5.',
      'Set 6.',
      'Set 7.',
    ],
  },
  {
    title: 'PCR',
    items: [
      'Ehrlichia canis',
      'Babesia canis',
      'Hepatozoon canis',
      'Anaplasma platys',
      'Mycoplasma spp.',
      'Canine distemper',
      'FIP',
      'Leptospira',
    ],
  },
  {
    title: 'Cytology & Histopath',
    items: ['Cytology', 'Biopsy', 'Necropsy'],
  },
];

const CounterBox = styled(Box)(({ theme }) => ({
  position: 'sticky',
  top: 0,
  backgroundColor: theme.palette.background.paper,
  zIndex: 1,
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const LabForm = ({ selectedItems, setSelectedItems }) => {
  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setSelectedItems((prev) =>
      checked ? [...prev, name] : prev.filter((item) => item !== name)
    );
  };

  return (
    <Box p={3}>
      <CounterBox>
        <Typography variant="h6" gutterBottom>
          Selected Items: {selectedItems.length} {/* Counter Display */}
        </Typography>
      </CounterBox>
      <Grid container spacing={3}>
        {sections.map((section, index) => (
          <Grid item xs={12} md={12} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {section.title}
                </Typography>
                <Grid container spacing={2}>
                  {section.items.map((item) => (
                    <Grid item xs={6} key={item}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedItems.includes(item)}
                            onChange={handleCheckboxChange}
                            name={item}
                          />
                        }
                        label={item}
                      />
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

LabForm.propTypes = {
  selectedItems: PropTypes.array.isRequired,
  setSelectedItems: PropTypes.func.isRequired,
};

export default LabForm;

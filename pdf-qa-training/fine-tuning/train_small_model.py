# Fine-tuning approach for small models

import json
import torch
from transformers import (
    AutoTokenizer, 
    AutoModelForCausalLM, 
    TrainingArguments, 
    Trainer,
    DataCollatorForLanguageModeling
)
from datasets import Dataset
from peft import LoraConfig, get_peft_model, TaskType
import os

class SmallModelFineTuner:
    def __init__(self, model_name: str = "microsoft/DialoGPT-small"):
        """
        Initialize with a small model suitable for browser deployment
        Options:
        - microsoft/DialoGPT-small (~117M parameters)
        - distilgpt2 (~82M parameters) 
        - TinyLlama/TinyLlama-1.1B-Chat-v1.0 (~1.1B parameters)
        """
        self.model_name = model_name
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForCausalLM.from_pretrained(model_name)
        
        # Add padding token if not present
        if self.tokenizer.pad_token is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token
            self.model.config.pad_token_id = self.model.config.eos_token_id
    
    def prepare_training_data(self, chunks_file: str, qa_pairs_file: str = None):
        """Prepare training data from chunks and Q&A pairs"""
        # Load chunks
        with open(chunks_file, 'r', encoding='utf-8') as f:
            chunks = json.load(f)
        
        training_texts = []
        
        if qa_pairs_file and os.path.exists(qa_pairs_file):
            # Use manually created Q&A pairs
            with open(qa_pairs_file, 'r', encoding='utf-8') as f:
                qa_pairs = json.load(f)
            
            for qa in qa_pairs:
                # Format as conversation
                text = f"Question: {qa['question']}\nContext (Page {qa['page']}): {qa['context']}\nAnswer: {qa['answer']}"
                training_texts.append(text)
        else:
            # Generate training data from chunks (basic approach)
            for chunk in chunks:
                # Create a format that teaches the model to reference pages
                text = f"Document excerpt from page {chunk['page']}: {chunk['text']}"
                training_texts.append(text)
        
        return training_texts
    
    def tokenize_data(self, texts: list, max_length: int = 512):
        """Tokenize training data"""
        def tokenize_function(examples):
            return self.tokenizer(
                examples['text'], 
                truncation=True, 
                padding=True, 
                max_length=max_length,
                return_tensors="pt"
            )
        
        dataset = Dataset.from_dict({'text': texts})
        tokenized_dataset = dataset.map(tokenize_function, batched=True)
        return tokenized_dataset
    
    def setup_lora(self):
        """Setup LoRA for efficient fine-tuning"""
        lora_config = LoraConfig(
            task_type=TaskType.CAUSAL_LM,
            inference_mode=False,
            r=8,  # Low rank
            lora_alpha=32,
            lora_dropout=0.1,
            target_modules=["c_attn", "c_proj"]  # For GPT-2 style models
        )
        
        self.model = get_peft_model(self.model, lora_config)
        self.model.print_trainable_parameters()
    
    def train(self, training_data, output_dir: str = "fine-tuned-model"):
        """Fine-tune the model"""
        # Setup LoRA for efficient training
        self.setup_lora()
        
        # Tokenize data
        tokenized_dataset = self.tokenize_data(training_data)
        
        # Training arguments
        training_args = TrainingArguments(
            output_dir=output_dir,
            overwrite_output_dir=True,
            num_train_epochs=3,
            per_device_train_batch_size=4,
            save_steps=500,
            save_total_limit=2,
            prediction_loss_only=True,
            learning_rate=5e-5,
            warmup_steps=100,
            logging_steps=100,
            dataloader_drop_last=False,
        )
        
        # Data collator
        data_collator = DataCollatorForLanguageModeling(
            tokenizer=self.tokenizer,
            mlm=False,
        )
        
        # Trainer
        trainer = Trainer(
            model=self.model,
            args=training_args,
            data_collator=data_collator,
            train_dataset=tokenized_dataset,
        )
        
        # Train
        print("Starting training...")
        trainer.train()
        
        # Save model
        trainer.save_model()
        self.tokenizer.save_pretrained(output_dir)
        
        print(f"Model saved to {output_dir}")
    
    def convert_for_webllm(self, model_dir: str, output_dir: str = "webllm-model"):
        """Convert model for WebLLM deployment"""
        print("Note: Converting to WebLLM format requires additional steps:")
        print("1. Convert to ONNX format")
        print("2. Quantize the model")
        print("3. Use @mlc-ai/web-llm tools to create web-compatible format")
        print("")
        print("For now, saving in HuggingFace format that can be manually converted.")
        
        # Save in a clean format
        os.makedirs(output_dir, exist_ok=True)
        
        # Merge LoRA weights if using LoRA
        if hasattr(self.model, 'merge_and_unload'):
            merged_model = self.model.merge_and_unload()
            merged_model.save_pretrained(output_dir)
        else:
            self.model.save_pretrained(output_dir)
        
        self.tokenizer.save_pretrained(output_dir)
        
        print(f"Clean model saved to {output_dir}")
        print("Use MLC-LLM tools to convert to WebLLM format")

def create_sample_qa_pairs():
    """Create sample Q&A pairs (you should replace this with real data)"""
    sample_qa = [
        {
            "question": "What is the main purpose of this document?",
            "context": "This document serves as a comprehensive guide...",
            "answer": "The main purpose of this document is to provide a comprehensive guide for...",
            "page": 1
        },
        # Add more Q&A pairs based on your PDF content
    ]
    
    with open('qa_pairs.json', 'w', encoding='utf-8') as f:
        json.dump(sample_qa, f, indent=2, ensure_ascii=False)
    
    print("Sample Q&A pairs created. Please edit qa_pairs.json with real data from your PDF.")

def main():
    # Check if we have the required files
    chunks_file = '../pdf-processing/processed_chunks.json'
    qa_pairs_file = 'qa_pairs.json'
    
    if not os.path.exists(chunks_file):
        print(f"Please run the PDF processing step first to create {chunks_file}")
        return
    
    if not os.path.exists(qa_pairs_file):
        print("Creating sample Q&A pairs file...")
        create_sample_qa_pairs()
        print("Please edit qa_pairs.json with real Q&A pairs from your PDF, then run this script again.")
        return
    
    # Initialize fine-tuner
    fine_tuner = SmallModelFineTuner("distilgpt2")  # Small model suitable for browser
    
    # Prepare training data
    print("Preparing training data...")
    training_data = fine_tuner.prepare_training_data(chunks_file, qa_pairs_file)
    print(f"Prepared {len(training_data)} training examples")
    
    # Train the model
    fine_tuner.train(training_data)
    
    # Convert for WebLLM
    fine_tuner.convert_for_webllm("fine-tuned-model", "webllm-ready-model")

if __name__ == "__main__":
    main()
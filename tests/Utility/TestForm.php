<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Test\Utility;

use Drjele\Symfony\JsonForm\Element\AbstractElement;
use Drjele\Symfony\JsonForm\Form\AbstractForm;
use Drjele\Symfony\JsonForm\Form\FormBuilder;

class TestForm extends AbstractForm
{
    protected function getDtoClass(): string
    {
        return TestDto::class;
    }

    protected function getRoute(): ?string
    {
        return 'test';
    }

    protected function build(FormBuilder $formBuilder): void
    {
        $formBuilder->addArray(
            'array',
            'array',
            ['test' => 'test'],
            AbstractElement::DATA_TYPE_STRING,
            AbstractElement::MODE_SINGLE
        )
            ->addAutocomplete(
                'autocomplete',
                'autocomplete',
                'autocomplete-route',
                AbstractElement::DATA_TYPE_STRING,
                AbstractElement::MODE_SINGLE
            )
            ->addBool('bool', 'bool')
            ->addDate('date', 'date')
            ->addInteger('integer', 'integer', 0, 100)
            ->addString('string', 'string');

        $formBuilder->addCollection('collection', 'collection')
            ->addArray(
                'array',
                'array',
                ['key' => 'value'],
                AbstractElement::DATA_TYPE_STRING,
                AbstractElement::MODE_SINGLE
            )
            ->addAutocomplete(
                'autocomplete',
                'autocomplete',
                'autocomplete-route',
                AbstractElement::DATA_TYPE_STRING,
                AbstractElement::MODE_SINGLE
            )
            ->addBool('bool', 'bool')
            ->addDate('date', 'date')
            ->addInteger('integer', 'integer', 0, 100)
            ->addString('string', 'string');
    }
}
